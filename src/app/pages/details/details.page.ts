import { Component, OnInit } from '@angular/core';
import { StorageService } from 'src/app/services/storage.service';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { DbService } from 'src/app/services/db.service';
import { ActionSheetController, ModalController, NavController, PopoverController } from '@ionic/angular';
import { PopoverComponent } from './popover/popover.component';
import { GlobalService } from 'src/app/services/global.service';
import { File } from '@ionic-native/file/ngx';
import { Crop } from '@ionic-native/crop/ngx';
import * as moment from 'moment';
import { VisitsComponent } from 'src/app/modals/visits/visits.component';
import { CameraService } from 'src/app/services/camera.service';

@Component({
  selector: 'app-details',
  templateUrl: './details.page.html',
  styleUrls: ['./details.page.scss'],
})
export class DetailsPage implements OnInit {

  client = <any>{};
  clientImages = <any>[];
  popover;
  max = moment().format("YYYY-MM-DD");
  proMode = this.storage.proMode;
  last_visit;
  actionSheet;
  loading = false;
  subscription;
  loadingValue = 0;
  constructor(private storage: StorageService, private camera: Camera, 
    private dbService: DbService, private popoverCtrl: PopoverController, public globalService: GlobalService, 
    private file: File, private crop: Crop, private navCtrl: NavController, public actionSheetCtrl: ActionSheetController, 
    public modalCtrl: ModalController, private cameraService: CameraService) { }

  async ngOnInit() {
    this.client = this.storage.data;
    this.subscription = this.globalService.getObservable().subscribe(async (data) => {
      console.log("DETAILS SUBSCRIBE");
      if (data.key === 'pro') {
        this.proMode = data.value;
      }else if (data.key === 'images') {
        if (data.flag) {
          this.clientImages = await this.dbService.getClientImages(this.client);
          this.clientImages.shift();
          console.log(this.clientImages);
          this.client.image = this.clientImages[this.clientImages.length -1];
          this.loading = false;
        } else {
          this.clientImages = await this.dbService.getClientImages(this.client);
          this.clientImages.shift();
          this.loading = false;
        }
      } else if (data.key === 'uploadStatus') {
        this.loadingValue = data.value;
      }
    })
  }

  ngOnDestroy() {
    //this.subscription.unsubscribe();
  }

  ionViewWillEnter() {
    this.client.visits.sort(this.sortByProperty("date"));
  }

  sortByProperty(property){  
    return function(a,b){  
       if(a[property] < b[property])  
          return 1;  
       else if(a[property] > b[property])  
          return -1;  
   
       return 0;  
    }  
 }

  async editProfileImg() {
    //if they don't have pro mode, prompt them to buy it here
    if (this.proMode) {
      if (this.loading) return;
      else this.loading = true;
      this.cameraService.startCameraProcess(this.client, true);
    } else {
      alert("Please buy pro mode");
    }
  }

  async addPhoto() {
    //if they don't have pro mode, prompt them to buy it here
    if (this.proMode) {
      if (this.loading) return;
      else this.loading = true;
      this.cameraService.startCameraProcess(this.client, false);
    } else {
      alert("Please buy pro mode");
    }
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
        text: "Delete Client"
      }
    })
    this.popover.onDidDismiss().then((res) => {
      if (res) {
        if (res.data.delete) {
          this.navCtrl.pop();
        }
      }
    })
    return await this.popover.present();
  }

  async showVisits(visit) {
    let modal = await this.modalCtrl.create({
      component: VisitsComponent,
      componentProps: {
        visit: visit,
        client: this.client,
        editing: visit == null
      }
    })
    modal.onDidDismiss().then(() => {
      console.log(this.client);
      this.client = this.storage.data;
      console.log(this.client);
    })
    return await modal.present();
  }

  async save() {
    if (this.loading) return;
    else this.loading = true;
    let res = await this.dbService.editClient(this.client);
    this.loading = false;
    this.navCtrl.pop();
  }

  dismissPopover() {
    this.popover.dismiss();
  }

  

}
