import {Component, ElementRef, Input, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import 'rxjs/add/operator/retry';

interface UptokenResponse {
    uptoken: string ;
}

interface UpRet {
    hash: string;
    key: string;
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
            this.http.post( 'http://up.qiniu.com', formData, {})
                .retry(3)
                .subscribe(
                    data => {
                        this.data = data;
                    },
                    err => {
                      this.data = err;
                    }
                );
            this.loading = false;
        }
    }
    blockUpload(): void {
        const inputEl = this.el.nativeElement.firstElementChild;
        if (inputEl.files.length === 0) {
            return;
        };

        const files: FileList = inputEl.files;
    }
}
