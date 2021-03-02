import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActionSheetController, ModalController, NavController } from '@ionic/angular';
import * as moment from 'moment';
import { DbService } from 'src/app/services/db.service';
import { StorageService } from 'src/app/services/storage.service';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { File } from '@ionic-native/file/ngx';
import { Crop } from '@ionic-native/crop/ngx';
import { Base64 } from '@ionic-native/base64/ngx';
import { DomSanitizer } from '@angular/platform-browser';
import csc from 'country-state-city'
import { PetsComponent } from 'src/app/modals/pets/pets.component';

@Component({
  selector: 'app-add',
  templateUrl: './add.page.html',
  styleUrls: ['./add.page.scss'],
})
export class AddPage implements OnInit {

  client = <any>{}
  today = moment().format("YYYY-MM-DD");
  max = moment().format("YYYY-MM-DD");
  actionSheet;
  loading = false;
  accountType;
  countries = csc.getAllCountries();
  states;
  constructor(private router: Router, private dbService: DbService, public storage: StorageService, 
    private navCtrl: NavController, public actionSheetCtrl: ActionSheetController, private camera: Camera, private file: File,
    private crop: Crop, private base64: Base64, private sanitizer: DomSanitizer, private modalCtrl: ModalController) { }

  async ngOnInit() {
    this.client.last_visit = this.today;
    let account = this.dbService.accountType ? this.dbService.accountType : <any>await this.dbService.getAccountType();
    this.accountType = account;
    console.log(this.accountType);
    console.log(this.countries);
  }

  goBack() {
    this.navCtrl.pop();
  }

  getStates() {
    this.states = csc.getStatesOfCountry(this.client.country);
  }

  async submit() {
    if (this.loading) return;
    else this.loading = true;
    console.log(this.client);
    this.client.visits = [];
    await this.dbService.addClient(this.client);
    this.loading = false;
    this.goBack();
  }

  async addPhoto() {
    await this.doActionSheetCamera();
  }

  async addPets() {
    let modal = await this.modalCtrl.create({
      component: PetsComponent,
      componentProps: {
        pets: []
      }
    });
    modal.onDidDismiss().then((data) => {
      if (data.data) {
        this.client.pets = data.data;
      }
    });
    return await modal.present();
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
        resolve(true);
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
