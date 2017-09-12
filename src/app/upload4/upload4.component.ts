import {Component, ElementRef, Input, OnInit} from '@angular/core';
import {HttpClient, HttpEventType, HttpHeaders, HttpRequest, HttpResponse} from '@angular/common/http';
import 'rxjs/add/operator/retry';
import {unescape} from 'querystring';

interface UptokenResponse {
    uptoken: string ;
}

interface MkBlkRet {
    ctx: string;
    checksum: string;
    crc32: string;
    offset: string;
    host: string;
}

@Component({
  selector: 'app-upload4',
  templateUrl: './upload4.component.html',
  styleUrls: ['./upload4.component.css']
})


export class Upload4Component implements OnInit {
    uptoken: string;
    loading: boolean;
    blockSize: number = 4 * 1024 * 1024;
    progress: string;
    percentDone = 0;
    upHost = 'http://upload.qiniu.com';
    @Input() multiple = true;

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
                'POST', this.upHost , formData,
                {reportProgress: true});
            this.http.request(request)
                .retry(3)
                .subscribe(
                    event => {
                        if (event.type === HttpEventType.UploadProgress) {
                            this.loading = true;
                            this.percentDone = Math.round(100 * event.loaded / event.total);
                            this.progress = `File is ${this.percentDone}% uploaded.`;
                        } else if (event instanceof HttpResponse) {
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
        const files: FileList = inputEl.files;
        for (let i = 0 ; i < files.length ; i++) {
            this.makeBlock(files[i], files[i].name);
        }
    }
    makeBlock(file: File, key: string): void {
        const fileSize: number = file.size;
        const list: string[] = [];
        const blockCount = Math.ceil(fileSize / this.blockSize);
        for ( let i = 0; i < blockCount; i ++) {
            const start: number = i * this.blockSize;
            const end: number = start + this.blockSize;
            this.http.post<MkBlkRet>(this.upHost + '/mkblk/' + file.slice(start, end).size , file.slice(start, end),
            {headers: new HttpHeaders().set('Authorization', 'UpToken ' + this.uptoken),
            }).subscribe(
                data => {
                    list[i] = data.ctx;
                    let m: Boolean = true;
                    for (let n = 0; n < list.length; n++) {
                        if ((list[n] == null)) {
                            m = false;
                        }
                    }
                    this.progress = `Block ${i} is uploaded`
                    console.log(`列表完整${m}, 分块数量${blockCount}, 列表长度${list.length}, 是否合并${m && (list.length === blockCount)}`);
                    if (m && (list.length === blockCount)) {
                        this.makeFile(list.toString(), fileSize, key);
                    }
                },
                err => {
                    console.log(err);
                }
            );
        }
    }
    makeFile(list: string, fileSize: number, key: string): void {
        this.http.post(this.upHost + '/mkfile/' + fileSize + '/key/' + btoa(key), list.toString(),
            {headers: new HttpHeaders().set('Authorization', 'UpToken ' + this.uptoken),
            }).subscribe(
            data => {
                this.progress = `${data['key']} is uploaded`;
            },
            err => {
                console.log(err);
            }
        );
    }
}
