import { Injectable } from '@angular/core';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { ActionSheetController, ModalController } from '@ionic/angular';
import { CropImageComponent } from '../modals/crop-image/crop-image.component';
import { DbService } from './db.service';
import { GlobalService } from './global.service';

@Injectable({
  providedIn: 'root'
})
export class CameraService {
  actionSheet;
  dontUpload = false;
  constructor(private actionSheetCtrl: ActionSheetController, private camera: Camera, private modalCtrl: ModalController,
    private dbService: DbService, private globalService: GlobalService) { }

  async startCameraProcess(client, flag) {
    if (client) {
      return new Promise(async (resolve, reject) => {
        await this.showActionSheet(flag, client);
        resolve();
      });
    } else {
      this.dontUpload = true;
      return new Promise(async (resolve, reject) => {
        await this.showActionSheet(flag, client);
        resolve();
      });
    }
  }

  async showActionSheet(flag, client) {
    this.actionSheet = await this.actionSheetCtrl.create({
      header: "Photo Source",
      buttons: [{
        text: 'Library',
        handler: async () => {
          return new Promise(async (resolve, reject) => {
            this.actionSheet.dismiss();
            await <any>this.doCamera(0, flag, client);
            resolve();
          });
        }
      }, 
      {
        text: 'Camera',
        handler: async () => {
          return new Promise(async (resolve, reject) => {
            this.actionSheet.dismiss();
            await <any>this.doCamera(1, flag, client);
            resolve();
          });
        }
      }]
    });
    await this.actionSheet.present();
  }

  async doCamera(source, flag, client) {
    return new Promise((resolve, reject) => {
      const options: CameraOptions = {
        quality: 100,
        destinationType: this.camera.DestinationType.DATA_URL,
        encodingType: this.camera.EncodingType.JPEG,
        mediaType: this.camera.MediaType.PICTURE,
        sourceType: source,
        targetHeight: 1024,
        targetWidth: 1024,
        correctOrientation: true
      }      
      this.camera.getPicture(options).then(async (imageData) => {
        let cropModal = await this.modalCtrl.create({
          component: CropImageComponent,
          componentProps: { "imageBase64": "data:image/jpeg;base64," + imageData, "width": 1024, "height": 1024 }
        });
        cropModal.onDidDismiss().then(async data => {
          let img = data.data;
          if (!this.dontUpload) {
            await this.dbService.uploadImage(img, client.uuid);
            let images = <any>await this.dbService.getClientImages(client);
            this.globalService.publishData({key: 'images', value: images, flag: flag});
            resolve();
          } else {
            this.globalService.publishData({key: 'images', value: img, flag: flag});
            resolve();
          }
          
        });
        cropModal.present();
      }, (err) => {
        // Handle error
        reject(err);
      });
    })
  }

}
