import { Component, ElementRef, Input } from '@angular/core';
import { Http} from '@angular/http';


@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent  {
  data: Object;
  loading: boolean;
  token;

  @Input() multiple = false;
  constructor(private http: Http,
              private el: ElementRef) { }

  getToken() {
    this.loading = true;
    this.http.request('http://localhost:8083/uptoken')
    .subscribe((res) => {
      this.token = res.json().uptoken;
      this.loading = false;
    },
        error => {
            console.log(error);
            this.token = 'FMVCRs2-LO1ivRNi4l7mEZE6ZD' +
                'vPv-519D12kZCO:rqctQu7hDhQ4H0UrJ4X3NTR5R8I=:eyJzY29wZSI6IjA4MTZkaXNwbGF5IiwiZGVhZGxpbmUiOjE2MDQ0OTU5NTR9';
        });
  }

  formUpload() {
    const inputEl = this.el.nativeElement.firstElementChild;
    if (inputEl.files.length === 0) { return; };

    const files: FileList = inputEl.files;


    for (let i = 0; i < files.length; i++) {
      const formData = new FormData();
      formData.append('file', files[i]);
      formData.append('key', files[i].name);
      formData.append('token', this.token);
      this.loading = true;
      this.http
        .post('http://up-z0.qiniu.com', formData)
        .subscribe((res) => {
          this.data = res.json();
          this.loading = false;
        },
          error => {
            console.log(error);
          });
    }
  }

  // blockUpload() {
  //     const inputEl = this.el.nativeElement.firstElementChild;
  //     if (inputEl.files.length === 0) { return; };
  //
  //     const files: FileList = inputEl.files;
  //
  // }
}
