import { QiniuAngularUploadDemoPage } from './app.po';

describe('qiniu-angular-upload-demo App', function() {
  let page: QiniuAngularUploadDemoPage;

  beforeEach(() => {
    page = new QiniuAngularUploadDemoPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
