import { Component, OnInit } from '@angular/core';
// import { Crop } from '@ionic-native/crop/ngx';
import { ActionSheetController, ModalController, NavParams, PopoverController } from '@ionic/angular';
import * as moment from 'moment';
import { PopoverComponent } from 'src/app/pages/details/popover/popover.component';
import { CameraService } from 'src/app/services/camera.service';
import { DbService } from 'src/app/services/db.service';
import { GlobalService } from 'src/app/services/global.service';
import { StorageService } from 'src/app/services/storage.service';
import { v4 as uuidv4 } from 'uuid';
import { CropImageComponent } from '../crop-image/crop-image.component';
import { SocialSharing } from '@awesome-cordova-plugins/social-sharing/ngx';
import * as watermark from 'watermarkjs';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';

@Component({
  selector: 'app-visits',
  templateUrl: './visits.component.html',
  styleUrls: ['./visits.component.scss'],
})
export class VisitsComponent implements OnInit {
  client;
  max = moment().format("YYYY-MM-DD");
  today = moment().format("YYYY-MM-DD");
  last_visit;
  actionSheet;
  isEditing = false;
  visit = <any>{};
  summary;
  visit_date;
  added_image;
  loading = false;
  subscription; 
  popover;
  loadingValue = 0;
  pet = "";
  appointments = [];
  selectedAppointment = <any>{};
  constructor(public navParams: NavParams, private storage: StorageService,
    private dbService: DbService, private modalCtrl: ModalController,
    private cameraService: CameraService, private globalService: GlobalService, private popoverCtrl: PopoverController,
    private socialShare: SocialSharing, private file: File) { 
    if (this.navParams.data.visit != null) {
      this.visit = this.navParams.data.visit;
    } else {
      this.visit = <any>{
        image: ""
      };
    }
    this.client = this.navParams.data.client;
    this.isEditing = this.navParams.data.editing;
    this.subscription = this.globalService.getObservable().subscribe(async (data) => {
      if (data.key === 'images') {
        if (!data.value) {
          this.loading = false;
          return;
        }
        this.added_image = data.value[data.value.length - 1];
        if (!this.visit)
          this.visit = <any>{
            image: ""
          }
        this.visit.image = this.added_image;
        
        if (!this.isEditing) {
          for (let i = 0; i < this.client.visits.length; i++) {
            if (this.client.visits[i].uuid == this.visit.uuid) {
              this.client.visits[i] = this.visit;
              break;
            }
          }
          await this.dbService.editClientVisit(this.client);
        }
        this.loading = false;
      } else if (data.key === 'uploadStatus') {
        this.loadingValue = data.value;
      }
    })
  }

  async ngOnInit() {
    await this.dbService.getAllAppointments();
    for (let i = 0; i < this.storage.appointments.length; i++) {
      if (this.storage.appointments[i].client == this.client.id) {
        let appDate = moment(this.storage.appointments[i].date);
        if (appDate.isSameOrBefore(moment()))
          this.appointments.push(this.storage.appointments[i]);
      }
    }
  }

  appointmentSelected() {
    let temp = this.appointments[this.selectedAppointment];
    this.pet = temp.pet
    this.visit_date = temp.date;
    console.log(this.pet);
  }

  ngOnDestroy() {
    //this.subscription.unsubscribe();
  }


  async addPhoto() {
      if (this.loading) return;
      else this.loading = true;
      this.cameraService.startCameraProcess(this.client, false);
  }

  // async share() {
  //   let file = <any>await this.downloadFile(this.visit.image);
  //   if (!this.storage.proMode || !this.dbService.bypassPro) {
  //     file = await this.file.readAsDataURL(this.file.dataDirectory, "temp.png");
  //     let blobFile = await this.dataURItoBlob(file);
  //     file = <any>await this.addImageWatermark(blobFile);
  //   }
    
  //   this.socialShare.share(null, null, file, null);
  // }

  // async downloadFile(image) {
  //   return new Promise( async (resolve, reject) => {
  //     const fileTransfer = this.fileTransfer.create();
  //     let file = await fileTransfer.download(image, this.file.dataDirectory + 'temp.png');
  //     resolve(file.toURL());
  //   });
  // }

  async share() {
    let file = await this.downloadFile(this.visit.image);
    if (!this.storage.proMode || !this.dbService.bypassPro) {
        const readFile = await Filesystem.readFile({
            path: 'temp.png',
            directory: Directory.Data
        });
        let blobFile = await this.dataURItoBlob(readFile.data);
        file = await this.addImageWatermark(blobFile) as string;
    }

    this.socialShare.share(null, null, file, null);
  }

  async downloadFile(image) {
      const response = await fetch(image);
      const blob = await response.blob();
      await Filesystem.writeFile({
          path: 'temp.png',
          data: blob,
          directory: Directory.Data
      });
      const res = await Filesystem.getUri({
          directory: Directory.Data,
          path: 'temp.png'
      });

      return res.uri;
  }

  async addTextWatermark(file) {
    return new Promise( async (resolve, reject) => {
        let img = await watermark([file]).image(watermark.text.lowerLeft('Shared from Clipped', '95px Arial', '#fff', 0.8));
        resolve(img.src);
    });
  }

  async addImageWatermark(file) {
    return new Promise( async (resolve, reject) => {
      let img = await watermark([file, 'assets/images/watermark.png']).image(watermark.image.lowerLeft(0.7));
      resolve(img.src);
  });
  }
  dataURItoBlob(dataURI) {
    // convert base64/URLEncoded data component to raw binary data held in a string
    var byteString;
    if (dataURI.split(',')[0].indexOf('base64') >= 0)
        byteString = atob(dataURI.split(',')[1]);
    else
        byteString = unescape(dataURI.split(',')[1]);

    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    // write the bytes of the string to a typed array
    var ia = new Uint8Array(byteString.length);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ia], {type:mimeString});
}


  async submit() {
    if (this.isEditing) {
      if(!this.pet) return
      let obj = <any>{
        summary: this.summary ? this.summary : null,
        uuid: uuidv4(),
        date: moment().format("MMM Do YYYY"),
        pet: this.pet
      }
      if (this.added_image) obj.image = this.added_image;
      this.client.visits.push(obj);
      await this.dbService.editClientVisit(this.client);
      this.modalCtrl.dismiss();
    } else {
      // update existing visit image
      for (let i = 0; i < this.client.visits.length; i++) {
        if (this.client.visits[i].uuid == this.visit.uuid) {
          this.client.visits[i] = this.visit;
          break;
        }
      }
      await this.dbService.editClientVisit(this.client);
      await this.dbService.getClients();
      this.modalCtrl.dismiss();
    }
  }

  goBack() {
    this.modalCtrl.dismiss();
  }

  async showMore(ev: any) {
    this.popover = await this.popoverCtrl.create({
      component: PopoverComponent,
      cssClass: 'my-custom-class',
      event: ev,
      translucent: true,
      componentProps: {
        client: this.client,
        popover: this.popover,
        text: "Delete Visit",
        visit: this.visit
      }
    })
    this.popover.onDidDismiss().then(async (res) => {
      if (res) {
        if (res.data.delete) {
          await this.dbService.getClients();
          this.modalCtrl.dismiss();
        }
      }
    })
    return await this.popover.present();
  }
}
