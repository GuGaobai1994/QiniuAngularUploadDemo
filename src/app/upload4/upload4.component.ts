import {Component, ElementRef, Input, OnInit} from '@angular/core';
import {HttpClient, HttpEventType, HttpHeaders, HttpRequest, HttpResponse} from '@angular/common/http';
import 'rxjs/add/operator/retry';

interface UptokenResponse {
    uptoken: string ;
}

interface UpRet {
    hash: string;
    key: string;
}

interface MkBlkRet {
    ctx: string;
    checksum: string;
    crc32: string;
    offset: string;
    host: string;
}

class CtxList {
    private num: number;
    private ctx: string;
    constructor(num, ctx) {
    }
}

@Component({
  selector: 'app-upload4',
  templateUrl: './upload4.component.html',
  styleUrls: ['./upload4.component.css']
})


export class Upload4Component implements OnInit {
    uptoken: string;
    loading: boolean;
    data: object;
    blockSize: number = 4 * 1024 * 1024;
    progress: string;
    @Input() multiple = false;

    constructor(private http: HttpClient, private el: ElementRef) {
    }

    ngOnInit(): void {
        this.http.get<UptokenResponse>('http://localhost:8083/uptoken').subscribe(
            data => {
                this.uptoken = data.uptoken;
            },
            err => {
                this.uptoken = 'FMVCRs2-LO1ivRNi4l7mEZE6ZDvPv-519D12kZCO:rqctQu7hDhQ4H0U' +
                    'rJ4X3NTR5R8I=:eyJzY29wZSI6IjA4MTZkaXNwbGF5IiwiZGVhZGxpbmUiOjE2MDQ0OTU5NTR9';
            });
    }

    formUpload(): void {
        const inputEl = this.el.nativeElement.firstElementChild;
        if (inputEl.files.length === 0) {
            return;
        };

        const files: FileList = inputEl.files;


        for (let i = 0; i < files.length; i++) {
            const formData = new FormData();
            formData.append('file', files[i]);
            formData.append('key', files[i].name);
            formData.append('token', this.uptoken);
            this.loading = true;
            const request = new HttpRequest(
                'POST', 'http://up.qiniu.com', formData,
                {reportProgress: true});
            this.http.request(request)
                .retry(3)
                .subscribe(
                    event => {
                        // Via this API, you get access to the raw event stream.
                        // Look for upload progress events.
                        if (event.type === HttpEventType.UploadProgress) {
                            // This is an upload progress event. Compute and show the % done:
                            const percentDone = Math.round(100 * event.loaded / event.total);
                            console.log(`File is ${percentDone}% uploaded.`);
                            this.progress = `File is ${percentDone}% uploaded.`;
                        } else if (event instanceof HttpResponse) {
                            console.log(`${event.body['key']} is uploaded`)
                            this.progress = `${event.body['key']} is uploaded`;
        }});
            this.loading = false;
        }
    }
    blockUpload(): void {
        const inputEl = this.el.nativeElement.firstElementChild;
        if (inputEl.files.length === 0) {
            return;
        };
        const list: string[] = [];
        const files: FileList = inputEl.files;
        const fileSize = files[0].size;
        const blockCount = Math.ceil(fileSize / this.blockSize);
        for ( let i = 0; i < blockCount; i ++) {
            const start: number = i * this.blockSize;
            const end: number = start + this.blockSize;
            this.http.post<MkBlkRet>('http://up.qiniu.com/mkblk/' + files[0].slice(start, end).size , files[0].slice(start, end),
            {headers: new HttpHeaders().set('Authorization', 'UpToken ' + this.uptoken),
            }).subscribe(
                data => {
                    this.data = data;
                    list[i] = data.ctx;
                    let m: Boolean = true;
                    for (let n = 0; n < list.length; n++) {
                        if ((list[n] == null)) {
                            m = false;
                        }
                    }
                    console.log(m);
                    if (m && (list.length = blockCount)) {
                        this.makeFile(list.toString(), fileSize);
                    }
                },
                err => {
                    this.data = err;
                }
            );
        }
    }
    makeFile(list: string, fileSize: number): void {
        this.http.post<MkBlkRet>('http://up.qiniu.com/mkfile/' + fileSize , list.toString(),
            {headers: new HttpHeaders().set('Authorization', 'UpToken ' + this.uptoken),
            }).subscribe(
            data => {
                this.data = data;
            },
            err => {
                this.data = err;
            }
        );

    }


}
