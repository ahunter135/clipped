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
import csc from 'country-state-city'

@Component({
  selector: 'app-details',
  templateUrl: './details.page.html',
  styleUrls: ['./details.page.scss'],
})
export class DetailsPage implements OnInit {

  client = <any>{
    location: <any>{}
  };
  clientImages = <any>[];
  popover;
  max = moment().format("YYYY-MM-DD");
  proMode = this.storage.proMode;
  last_visit;
  actionSheet;
  loading = false;
  subscription;
  accountType;
  loadingValue = 0;
  countries = csc.getAllCountries();
  states;
  constructor(private storage: StorageService, private camera: Camera, 
    private dbService: DbService, private popoverCtrl: PopoverController, public globalService: GlobalService, 
    private file: File, private crop: Crop, private navCtrl: NavController, public actionSheetCtrl: ActionSheetController, 
    public modalCtrl: ModalController, private cameraService: CameraService) { }

  async ngOnInit() {
    this.client = this.storage.data;
    if (!this.client.location) this.client.location = <any>{};

    let account = this.dbService.accountType ? this.dbService.accountType : <any>await this.dbService.getAccountType();
    this.accountType = account;
    console.log(this.accountType);
    this.subscription = this.globalService.getObservable().subscribe(async (data) => {
      if (data.key === 'pro') {
        this.proMode = data.value;
      }else if (data.key === 'images') {
        if (data.flag) {
          if (!data.value) {
            this.loading = false;
            return;
          }
          this.clientImages = await this.dbService.getClientProfileImages(this.client);
          this.client.image = this.clientImages[this.clientImages.length - 1];
          this.loading = false;
          this.save();
        } else {
          if (!data.value) {
            this.loading = false;
            return;
          }
          this.clientImages = await this.dbService.getClientImages(this.client);
          //this.clientImages.shift();
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

  getStates() {
    this.states = csc.getStatesOfCountry(this.client.location.country);
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
      if (this.loading) return;
      else this.loading = true;
      this.cameraService.startCameraProcess(this.client, true);
  }

  async addPhoto() {
    if (this.loading) return;
    else this.loading = true;
    this.cameraService.startCameraProcess(this.client, false);
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
        text: "Delete Client",
        inDetails: true
      }
    })
    this.popover.onDidDismiss().then((res) => {
      if (res.data) {
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
    let res = await this.dbService.editClient(this.client);
    this.loading = false;
  }

  dismissPopover() {
    this.popover.dismiss();
  }

  

}
