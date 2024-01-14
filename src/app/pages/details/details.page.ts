import { Component, OnInit, ViewChild } from '@angular/core';
import { StorageService } from 'src/app/services/storage.service';
import { DbService } from 'src/app/services/db.service';
import { ActionSheetController, IonInput, ModalController, NavController, PopoverController } from '@ionic/angular';
import { PopoverComponent } from './popover/popover.component';
import { GlobalService } from 'src/app/services/global.service';
import * as moment from 'moment';
import { VisitsComponent } from 'src/app/modals/visits/visits.component';
import { CameraService } from 'src/app/services/camera.service';
import { Country, State } from 'country-state-city';
import { PetsComponent } from 'src/app/modals/pets/pets.component';
import * as randomcolor from 'random-hex-color'
import { PhonePipe } from 'src/app/pipes/phone.pipe';
import { ColorPickerComponent } from 'src/app/modals/color-picker/color-picker.component';
import { AddAppointmentComponent } from 'src/app/modals/add-appointment/add-appointment.component';
import { ViewAppointmentsComponent } from 'src/app/modals/view-appointments/view-appointments.component';
import { waitForAsync } from '@angular/core/testing';

declare var google: any;
@Component({
  selector: 'app-details',
  templateUrl: './details.page.html',
  styleUrls: ['./details.page.scss'],
})
export class DetailsPage implements OnInit {
  @ViewChild('searchbar') searchbar: IonInput;
  client = <any>{
    location: <any>{}
  };
  clientImages = <any>[];
  popover;
  max = moment().format("YYYY-MM-DD");
  last_visit;
  actionSheet;
  loading = false;
  subscription;
  accountType;
  loadingValue = 0;
  countries = Country.getAllCountries();
  states;
  searching = false;
  visits = [];
  temp;
  constructor(private storage: StorageService, 
    private dbService: DbService, private popoverCtrl: PopoverController, public globalService: GlobalService, 
    private navCtrl: NavController, public actionSheetCtrl: ActionSheetController, 
    public modalCtrl: ModalController, private cameraService: CameraService, private phone: PhonePipe) { }

  async ngOnInit() {
    this.client = Object.assign({}, await this.storage.getData());
    this.temp = JSON.parse(JSON.stringify(this.client));
    if (!this.client.color) {
      this.client.color = randomcolor();
      this.save();
    }
    if (!this.client.location) this.client.location = <any>{};
    if (this.client.location.country) this.getStates();
    let account = this.dbService.accountType ? this.dbService.accountType : <any>await this.dbService.getAccountType();
    this.accountType = account;

    this.subscription = this.globalService.getObservable().subscribe(async (data) => {
      if (data.key === 'pro') {
        //this.proMode = data.value;
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
          this.loading = false;
        }
      } else if (data.key === 'uploadStatus') {
        this.loadingValue = data.value;
      }
    })

    const input = document.getElementById("pac-input") as HTMLInputElement;
    const searchBox = new google.maps.places.SearchBox(input);
    searchBox.addListener("places_changed", (data) => {
      const places = searchBox.getPlaces();
      this.client.location.address = places[0].formatted_address;
      this.save();
    })
  }

  ngOnDestroy() {
    //this.subscription.unsubscribe();
  }

  ionViewWillEnter() {
    this.client.visits.sort(this.sortByProperty("date"));
    //this.client.visits.filter((item) => item.deleted == true);
    this.visits = this.client.visits.filter((item) => item.deleted !== true);
  }

  async ionViewWillLeave() {
    await this.dbService.getClients();
  }

  getStates() {
    this.states = State.getStatesOfCountry(this.client.location.country);
  }

  async viewPets() {
    this.storage.modalShown = true;
    let modal = await this.modalCtrl.create({
      component: PetsComponent,
      componentProps: {
        pets: this.client.pets ? this.client.pets : [],
        client: this.client
      }
    });
    modal.onDidDismiss().then((data) => {
      if (data.data) {
        this.client.pets = data.data;
        this.save();
        this.temp = JSON.parse(JSON.stringify(this.client));
      } else {
        // did not hit save, so overwrite changes
        this.client.pets = this.temp.pets;
      }
      this.storage.modalShown = false;
    });

    return await modal.present();
  }

  sortByProperty(property){  
    return function(a,b){  
      let date1 = moment(a[property], "MMM Do YYYY");
      let date2 = moment(b[property], "MMM Do YYYY");

       if(date1.isBefore(date2))  
          return 1;  
       else if(date1.isAfter(date2))  
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

  async formatPhone() {
    this.client.phone_number = this.phone.transform(this.client.phone_number, 'US');
  }

  async showVisits(visit) {
    this.storage.modalShown = true;
    let modal = await this.modalCtrl.create({
      component: VisitsComponent,
      componentProps: {
        visit: visit,
        client: this.client,
        editing: visit == null
      }
    })
    modal.onDidDismiss().then(async() => {
      this.client = await this.storage.getData();
      this.client.visits.sort(this.sortByProperty("date"));
      this.visits = this.client.visits.filter((item) => item.deleted !== true);
      this.storage.modalShown = false;
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

  async openColorPicker() {
    this.storage.modalShown = true;
    let modal = await this.modalCtrl.create({
      component: ColorPickerComponent,
      componentProps: {
        
      }
    })
    modal.onDidDismiss().then((data) => {
      if (data.data)
      this.client.color = data.data.color;
      this.storage.modalShown = false;
      this.save();
    })
    return await modal.present();
  }

  async searchAddress(ev: any) { 
    let searchVal = this.searchbar.value;
    const autocomplete = new google.maps.places.AutocompleteService();

    autocomplete.getPlacePredictions({
      input: searchVal,
      types: ['address']
    }, function(predictions, status) {
      console.log(predictions);
      this.items = predictions;
      this.searching = true;
    }.bind(this))
  }

  selectAddress(item) {
    this.client.location.address = item;
    this.searching = false;
    this.searchbar.value = "";
  }

  resetSearching() {
    if (this.client.location.address == "") {
      this.searching = false;
      this.searchbar.value = "";
    }
  }

  async addAppointment(passedApp) {
    this.storage.modalShown = true;
    let modal = await this.modalCtrl.create({
      component: AddAppointmentComponent,
      componentProps: {
        client: this.client,
        cameFromList: false,
        passedApp: passedApp ? passedApp : null
      }
    })
    modal.onDidDismiss().then(() => {
      this.dbService.getAllAppointments();
      this.storage.modalShown = false;
    });

    await modal.present();
  }

  async viewAppointments() {
    this.storage.modalShown = true;
    let modal = await this.modalCtrl.create({
      component: ViewAppointmentsComponent,
      componentProps: {
        client: this.client
      }
    })
    modal.onDidDismiss().then((data) => {
      this.storage.modalShown = false;
      if (data.data) {
        this.addAppointment(data.data);
      }
    });

    await modal.present();
  }
}
