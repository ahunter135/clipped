import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActionSheetController, NavController } from '@ionic/angular';
import * as moment from 'moment';
import { DbService } from 'src/app/services/db.service';
import { StorageService } from 'src/app/services/storage.service';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { File } from '@ionic-native/file/ngx';
import { Crop } from '@ionic-native/crop/ngx';
import { Base64 } from '@ionic-native/base64/ngx';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-add',
  templateUrl: './add.page.html',
  styleUrls: ['./add.page.scss'],
})
export class AddPage implements OnInit {

  client = <any>{}
  today = moment().format("MM-DD-YYYY");
  max = moment().format("YYYY-MM-DD");
  actionSheet;
  loading = false;
  constructor(private router: Router, private dbService: DbService, public storage: StorageService, 
    private navCtrl: NavController, public actionSheetCtrl: ActionSheetController, private camera: Camera, private file: File,
    private crop: Crop, private base64: Base64, private sanitizer: DomSanitizer) { }

  ngOnInit() {
    this.client.last_visit = this.today;
  }

  goBack() {
    this.navCtrl.pop();
  }

  async submit() {
    if (this.loading) return;
    else this.loading = true;
    await this.dbService.addClient(this.client);
    this.loading = false;
    this.goBack();
  }

  async addPhoto() {
    await this.doActionSheetCamera();
  }

  async doActionSheetCamera() {
    this.actionSheet = await this.actionSheetCtrl.create({
      header: "Photo Source",
      buttons: [{
        text: 'Library',
        handler: () => {
          this.doCamera(0);
        }
      }, 
      {
        text: 'Camera',
        handler: () => {
          this.doCamera(1);
        }
      }]
    });
    await this.actionSheet.present();
  }

  async doCamera(source) {
    return new Promise((resolve, reject) => {
      const options: CameraOptions = {
        quality: 100,
        destinationType: this.camera.DestinationType.FILE_URI,
        encodingType: this.camera.EncodingType.JPEG,
        mediaType: this.camera.MediaType.PICTURE,
        sourceType: source,
        targetHeight: 1024,
        targetWidth: 1024,
        correctOrientation: true
      }      
      this.camera.getPicture(options).then(async (imageData) => {
        imageData = await this.crop.crop(imageData, {quality: 100, targetWidth: 1024, targetHeight: 1024});
        let img = this.sanitizer.bypassSecurityTrustResourceUrl(await this.base64.encodeFile(imageData));
        resolve();
      }, (err) => {
        // Handle error
      });
    });
  }

  makeFileIntoBlob(_imagePath) {
    return new Promise((resolve, reject) => {
      let fileName = "";
      this.file
        .resolveLocalFilesystemUrl(_imagePath)
        .then(fileEntry => {
          let { name, nativeURL } = fileEntry;

          // get the path..
          let path = nativeURL.substring(0, nativeURL.lastIndexOf("/"));

          fileName = name;

          // we are provided the name, so now read the file into
          // a buffer
          return this.file.readAsArrayBuffer(path, name);
        })
        .then(buffer => {
          // get the buffer and make a blob to be saved
          let imgBlob = new Blob([buffer], {
            type: "image/jpeg"
          });
          resolve({
            fileName,
            imgBlob
          });
        })
        .catch(e => reject(e));
    });
  }



}
