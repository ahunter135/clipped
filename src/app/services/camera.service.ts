import { Injectable } from '@angular/core';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { ActionSheetController, ModalController } from '@ionic/angular';
import { rejects } from 'assert';
import { CropImageComponent } from '../modals/crop-image/crop-image.component';
import { DbService } from './db.service';
import { GlobalService } from './global.service';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class CameraService {
  actionSheet;
  dontUpload = false;
  constructor(private actionSheetCtrl: ActionSheetController, private camera: Camera, private modalCtrl: ModalController,
    private dbService: DbService, private globalService: GlobalService, private storage: StorageService) { }

  async startCameraProcess(client, flag) {
    if (client) {
      return new Promise(async (resolve, reject) => {
        await this.showActionSheet(flag, client);
        resolve(true);
      });
    } else {
      this.dontUpload = true;
      return new Promise(async (resolve, reject) => {
        await this.showActionSheet(flag, client);
        resolve(true);
      });
    }
  }

  async showActionSheet(flag, client) {
    this.actionSheet = await this.actionSheetCtrl.create({
      header: "Photo Source",
      backdropDismiss: false,
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
      }, {
        text: 'Cancel',
        handler: async () => {
          return new Promise(async (resolve, reject) => {
            this.actionSheet.dismiss();
            this.globalService.publishData({key: 'images', value: null, flag: flag});
            resolve();
          })
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
        this.storage.modalShown = true;
        let cropModal = await this.modalCtrl.create({
          component: CropImageComponent,
          componentProps: { "imageBase64": "data:image/jpeg;base64," + imageData, "width": 1024, "height": 1024 }
        });
        cropModal.onDidDismiss().then(async data => {
          let img = data.data;
          this.storage.modalShown = false;
          if (!this.dontUpload) {
            await this.dbService.uploadImage(img, client.uuid, flag);
            let images = <any>await this.dbService.getClientImages(client);
            console.log(images);
            this.globalService.publishData({key: 'images', value: images, flag: flag});
            resolve(true);
          } else {
            this.globalService.publishData({key: 'images', value: img, flag: flag});
            resolve(true);
          }
          
        });
        cropModal.present();
      }, (err) => {
        // Handle error
        this.globalService.publishData({key: 'images', value: null, flag: flag});
        reject(err);
      });
    })
  }

}
