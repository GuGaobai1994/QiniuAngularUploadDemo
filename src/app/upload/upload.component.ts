import { Component, ElementRef, Input } from '@angular/core';
import { Http,  Response} from '@angular/http';


@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent  {
  data: Object;
  loading: boolean;
  token: String;

  @Input() multiple: boolean = false;
  constructor(private http: Http,
              private el: ElementRef) { }

  getToken() : void {
    this.loading = true;
    this.http.request('http://localhost:8083/uptoken')
    .subscribe((res : Response) => {
      this.token = res.json().uptoken
    });
  }

  upload() : void{
    let inputEl = this.el.nativeElement.firstElementChild;
    if (inputEl.files.length === 0) { return; };

    let files: FileList = inputEl.files;


    for (let i = 0; i < files.length; i++) {
      const formData = new FormData();
      //formData.append(files[i].name, files[i]);
      formData.append('file', files[i]);
      formData.append('key', files[i].name)
      formData.append('token', this.token);
      this.loading = true;
      this.http
        .post('http://up-z0.qiniu.com', formData)
        .subscribe((res : Response) => {
          this.data = res.json();
          this.loading = false;
        });
    }
  }
}
