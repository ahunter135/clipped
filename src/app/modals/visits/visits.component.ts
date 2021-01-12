import { Component, OnInit } from '@angular/core';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { Crop } from '@ionic-native/crop/ngx';
import { File } from '@ionic-native/file/ngx';
import { ActionSheetController, ModalController, NavParams, PopoverController } from '@ionic/angular';
import * as moment from 'moment';
import { PopoverComponent } from 'src/app/pages/details/popover/popover.component';
import { CameraService } from 'src/app/services/camera.service';
import { DbService } from 'src/app/services/db.service';
import { GlobalService } from 'src/app/services/global.service';
import { StorageService } from 'src/app/services/storage.service';
import { v4 as uuidv4 } from 'uuid';
import { CropImageComponent } from '../crop-image/crop-image.component';
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
  proMode = this.storage.proMode;
  actionSheet;
  isEditing = false;
  visit = <any>{};
  summary;
  visit_date = this.today;
  added_image;
  loading = false;
  subscription; 
  popover;
  loadingValue = 0;
  constructor(public navParams: NavParams, private storage: StorageService,
    private dbService: DbService, private modalCtrl: ModalController,
    private cameraService: CameraService, private globalService: GlobalService, private popoverCtrl: PopoverController) { 
    if (this.navParams.data.visit != null) {
      this.visit = this.navParams.data.visit;
    }
    this.client = this.navParams.data.client;
    this.isEditing = this.navParams.data.editing;
    this.last_visit = this.today;
    this.subscription = this.globalService.getObservable().subscribe(async (data) => {
      console.log("VISIT SUBSCRIBE");
      if (data.key === 'images') {
        console.log(data.value[data.value.length - 1]);
        this.added_image = data.value[data.value.length - 1];
        this.loading = false;
      } else if (data.key === 'uploadStatus') {
        this.loadingValue = data.value;
      }
    })
  }

  ngOnInit() {}

  ngOnDestroy() {
    //this.subscription.unsubscribe();
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


  async submit() {
    if (this.isEditing) {
      if(!this.summary) return
      let obj = <any>{
        summary: this.summary,
        uuid: uuidv4(),
        date: moment(this.visit_date).format("MMM Do YYYY")
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
