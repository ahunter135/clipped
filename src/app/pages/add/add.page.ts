import { Component, OnInit } from '@angular/core';
import { ActionSheetController, ModalController, NavController, PopoverController, ToastController } from '@ionic/angular';
import * as moment from 'moment';
import { DbService } from 'src/app/services/db.service';
import { StorageService } from 'src/app/services/storage.service';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import csc from 'country-state-city'
import { PetsComponent } from 'src/app/modals/pets/pets.component';
import { PhonePipe } from 'src/app/pipes/phone.pipe';
import { ColorPickerComponent } from 'src/app/modals/color-picker/color-picker.component';
import { v4 as uuidv4 } from 'uuid';
import { CameraService } from 'src/app/services/camera.service';
import { GlobalService } from 'src/app/services/global.service';
import { Contacts } from '@ionic-native/contacts/ngx';

declare var google: any;
@Component({
  selector: 'app-add',
  templateUrl: './add.page.html',
  styleUrls: ['./add.page.scss'],
})
export class AddPage implements OnInit {

  client = <any>{
    color: "#ff9aa2"
  }
  today = moment().format("YYYY-MM-DD");
  max = moment().format("YYYY-MM-DD");
  actionSheet;
  loading = false;
  accountType;
  countries = csc.getAllCountries();
  states;
  tempAddress = "";
  items = [];
  searching = false;
  constructor(private dbService: DbService, public storage: StorageService, 
    private navCtrl: NavController, public actionSheetCtrl: ActionSheetController, private camera: Camera, private cameraService: CameraService,
    private modalCtrl: ModalController, private phone: PhonePipe, private globalService: GlobalService, private contacts: Contacts, private toastCtrl: ToastController) { }

  async ngOnInit() {
    this.client.last_visit = this.today;
    let account = this.dbService.accountType ? this.dbService.accountType : <any>await this.dbService.getAccountType();
    this.accountType = account;

    const input = document.getElementById("pac-input") as HTMLInputElement;
    const searchBox = new google.maps.places.SearchBox(input);
    searchBox.addListener("places_changed", (data) => {
      const places = searchBox.getPlaces();
      this.client.address = places[0].formatted_address;
    })

    this.client.uuid = uuidv4();

    this.globalService.getObservable().subscribe(async (data) => {
      if (data.key === 'images') {
        if (data.flag) {
          if (!data.value) {
            this.loading = false;
            return;
          }
          let clientImages = <any>await this.dbService.getClientProfileImages(this.client);
          this.client.image = clientImages[clientImages.length - 1];
          this.loading = false;
        } else {
          this.loading = false;
        }
      }
    })
  }

  async goBack() {
    await this.dbService.getClients();
    this.navCtrl.pop();
  }

  async importFromContacts() {
    let result = await this.contacts.pickContact();
    console.log(result);
    this.client.name = result.name.formatted;
    this.client.phone_number = result.phoneNumbers[0].value;
    this.client.email = result.emails[0].value;
    this.client.address = result.addresses[0].streetAddress + " " + result.addresses[0].region + ", " + result.addresses[0].postalCode;
  }

  getStates() {
    this.states = csc.getStatesOfCountry(this.client.country);
  }

  async formatPhone() {
    this.client.phone_number = this.phone.transform(this.client.phone_number, 'US');
  }

  async submit() {
    if (this.loading) return;
    else this.loading = true;
    this.client.visits = [];
    if (!this.client.pets) this.client.pets = [];
    if (!this.client.name || !this.client.address) {
      let t = await this.toastCtrl.create({
        message: "Please make sure client name and address are completed!",
        duration: 2000
      })
      await t.present();
      return;
    }
    await this.dbService.addClient(this.client);
    this.loading = false;
    this.goBack();
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
    })
    return await modal.present();
  }

  async addPets() {
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
        this.storage.modalShown = false;
      }
    });
    return await modal.present();

  }

  async editProfileImg() {
    if (this.loading) return;
    else this.loading = true;
    this.cameraService.startCameraProcess(this.client, true);
  }

}
