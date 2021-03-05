import { Component, ElementRef, ViewChild } from '@angular/core';
import { ActionSheetController, AlertController, ModalController } from '@ionic/angular';
import { DbService } from '../services/db.service';
import { StorageService } from '../services/storage.service';
import * as moment from 'moment';
import { ViewAppointmentComponent } from '../modals/view-appointment/view-appointment.component';
import { IonPullUpFooterState } from 'ionic-pullup';
import { ClientByIDPipe } from '../pipes/client-by-id.pipe';
import { GoogleMaps, GoogleMapsEvent, LatLng, MarkerOptions, Marker, GoogleMapsMapTypeId, Geocoder, GoogleMapsAnimation, HtmlInfoWindow, GoogleMapOptions, GoogleMap } from "@ionic-native/google-maps";
import { DatePipe } from '@angular/common';
import { LaunchNavigator, LaunchNavigatorOptions } from '@ionic-native/launch-navigator/ngx';

@Component({
  selector: 'app-tab4',
  templateUrl: 'tab4.page.html',
  styleUrls: ['tab4.page.scss']
})
export class Tab4Page {
  darkMode;
  appointments;
  tempAppointments;
  stylists = [];
  filterBy;
  @ViewChild('map') mapElement: ElementRef;
  map: GoogleMap;
  view = 'list';
  appointmentsShownOnMap = [];
  markers = [];
  footerState: IonPullUpFooterState;
  isPro = this.storage.proMode;
  constructor(public storage: StorageService, public dbService: DbService, private modalCtrl: ModalController, private clientByID: ClientByIDPipe,
    private datePipe: DatePipe, private actionSheetCtrl: ActionSheetController, private launchNav: LaunchNavigator, private alertController: AlertController) {
  }

  async ngOnInit() {
  }

  async ionViewWillEnter() {
    await this.dbService.getAllAppointments();
    await this.filterAppointments(this.storage.appointments);
    this.stylists = <any>await this.dbService.getStylists();
    if (!this.map)
      this.addMap();
    else {
      this.updateApps();
    }
  }

  ionViewDidEnter() {
  }

  async updateApps() {
    this.appointmentsShownOnMap = [];
    this.markers = [];
    this.map.clear();
    await this.dbService.getAllAppointments();
    await this.filterAppointments(this.storage.appointments);

    let clients = await this.getClientArrayFromAppointment();
    await this.addMarkers(clients);
    if (clients.length > 0) {
      let address = clients[0].location.address + " " + clients[0].location.zip;
      let results = await Geocoder.geocode( { 'address': address});

      let lat = results[0].position.lat;
      let lng = results[0].position.lng;
      let latLng = new LatLng(lat, lng);

      
      //Bouunds are set, see if any markers are here.
      for (let i = 0; i < this.markers.length; i++) {
        let region = this.map.getVisibleRegion();
        if (region.contains(this.markers[i].getPosition())) {
          let client = this.markers[i].get('client');
          this.appointmentsShownOnMap.push(client)
        }
      }
      
      this.appointmentsShownOnMap = this.appointmentsShownOnMap.sort(this.custom_sort_map);
    }
  }

  filterAppointments(appointments) {
    let dates = [];
    for (let i = 0; i < appointments.length; i++) {
      let day = moment(appointments[i].date);
      day.format("MM/DD/YYYY hh:mm a");
      if (day.isAfter(moment().format("MM/DD/YYYY hh:mm a")))
        dates.push(day.format("MM/DD/YYYY"));
      
    }

    let uniqueDates = Array.from(new Set(dates));

    let apps = [];
    for (let i = 0; i < uniqueDates.length; i++) {
      apps.push({date: uniqueDates[i], apps: []})
      for (let j = 0; j < appointments.length; j++) {
        let day = moment(appointments[j].date).format("MM/DD/YYYY");
        if (day == uniqueDates[i]) {
          let day = moment(appointments[j].date);
          let now = moment();
          if (day.isSameOrAfter(now)) 
          apps[i].apps.push(appointments[j]);
        }
      }
    }

    
    this.appointments = apps.sort(this.custom_sort);
    this.tempAppointments = this.appointments;
  }

  filterByStylist() {
    let temp = [];
    this.appointments = [];
    for (let i = 0; i < this.tempAppointments.length; i++) {
      for (let j = 0; j < this.tempAppointments[i].apps.length; j++) {
        if (this.tempAppointments[i].apps[j].stylist) {
          if (this.tempAppointments[i].apps[j].stylist == this.filterBy) {
            this.appointments.push(this.tempAppointments[i]);
          }
        } else this.appointments.push(this.tempAppointments[i]);
      }
    }
  }


  custom_sort(a, b) {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  }
  custom_sort_map(a,b) {
    return new Date(a.app.date).getTime() - new Date(b.app.date).getTime();
  }

  async openAppointment(item) {
    let modal = await this.modalCtrl.create({
      component: ViewAppointmentComponent,
      componentProps: {
        app: item
      }
    })
    return await modal.present();
  }

  async doRefresh(ev) {
    let apps = await this.dbService.getAllAppointments();
    this.filterAppointments(apps);
    ev.target.complete();
  }

  async addMap(){
    let clients = await this.getClientArrayFromAppointment();

    let latLng = new LatLng(36.213089, -86.306480);

    let mapOptions: GoogleMapOptions = {
      camera: {
        zoom: 5,
        target: latLng,
      },
      controls: {
        mapToolbar: false
      },
      mapType: GoogleMapsMapTypeId.ROADMAP
    }

    this.map = GoogleMaps.create(this.mapElement.nativeElement, mapOptions);

    this.map.one(GoogleMapsEvent.MAP_READY).then(async () => {
      this.addMarkers(clients);
      if (clients.length > 0) {
        let address = clients[0].location.address + " " + clients[0].location.zip;
        let results = await Geocoder.geocode( { 'address': address});
  
        let lat = results[0].position.lat;
        let lng = results[0].position.lng;
        let latLng = new LatLng(lat, lng);
        this.map.animateCamera({
          target: latLng,
          zoom: 10
        })
      }
    })
    
    this.map.on(GoogleMapsEvent.CAMERA_MOVE_END).subscribe(() => {
      this.appointmentsShownOnMap = [];
      //Bouunds are set, see if any markers are here.
      for (let i = 0; i < this.markers.length; i++) {
        let region = this.map.getVisibleRegion();
        if (region.contains(this.markers[i].getPosition())) {
          let client = this.markers[i].get('client');

          this.appointmentsShownOnMap.push(client)
        }
      }
      
      this.appointmentsShownOnMap = this.appointmentsShownOnMap.sort(this.custom_sort_map);
    })
  }

  addMarkers(clients) {
    for (let i = 0; i < clients.length; i++) {
      this.addMarker(clients[i]);
    }
  }

  async addMarker(client){
    let address = client.location.address + " " + client.location.zip;
    let results = await Geocoder.geocode( { 'address': address});
    let lat = results[0].position.lat;
    let lng = results[0].position.lng;

    let latLng = new LatLng(lat, lng);

    let pinColor;
    for (let i = 0; i < this.storage.clients.length; i++) {
      if (this.storage.clients[i].id == client.client_id) {
        pinColor = this.storage.clients[i].color ? this.storage.clients[i].color : 'red';
        client.color = pinColor;
        break;
      }
    }
    this.map.addMarker({
      position: latLng,
      animation: GoogleMapsAnimation.DROP,
      icon: pinColor,
      title: this.clientByID.transform(client.client_id).toString(),
      snippet: client.location.address + " - " + this.datePipe.transform(client.app.date, 'mediumDate') + " @ " + this.datePipe.transform(client.app.date, 'shortTime')
    }).then((marker:Marker) => {
      marker.set('client', client);
      marker.set('pet', client.app.pet ? JSON.stringify(client.app.pet) : null);
      this.markers.push(marker);

      marker.on(GoogleMapsEvent.MARKER_CLICK).subscribe(() => {
        marker.showInfoWindow();
      })
    })
  }

  async openSheet(client) {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Appointment Options',
      cssClass: 'my-custom-class',
      buttons: [{
        text: 'Navigate To',
        icon: this.isPro ? 'navigate' : 'star',
        handler: () => {
          if (!this.isPro) {
            this.presentAlertNotice("You will need to upgrade to Pro to use this feature!");
            return;
          }
          //Open navigation
          let location = client.location.address + " " + client.location.city + ", " + client.location.state + " " + client.location.zip; 
          this.launchNav.navigate(location);
        }
      },
      {
        text: 'Details',
        icon: 'information-circle',
        handler:async  () => {
          const modal = await this.modalCtrl.create({
            component: ViewAppointmentComponent,
            componentProps: {
              app: client.app
            }
          });

          return await modal.present();
        }
      }, 
      {
        text: 'Delete',
        role: 'destructive',
        icon: 'trash',
        handler: async () => {
          this.presentAlertConfirm("Are you sure you want to delete this appointment?").then(async (res) => {
            if (res) {
              await this.dbService.deleteAppointment(client);
              await this.updateApps();
            }
          });
          return true;
        }
      },{
        text: 'Cancel',
        icon: 'close',
        role: 'cancel',
        handler: () => {
          console.log('Cancel clicked');
        }
      }]
    });
    await actionSheet.present();
  }

  getClientArrayFromAppointment() {
    let client_array = [];
    for (let i = 0; i < this.appointments.length; i++) {
      for (let j = 0; j < this.appointments[i].apps.length; j++) {
        for (let k = 0; k < this.storage.clients.length; k++) {
          if (this.appointments[i].apps[j].client == this.storage.clients[k].id) {
            if (this.storage.clients[k].location) {
              let obj = {
                location: this.storage.clients[k].location,
                client_id: this.storage.clients[k].id,
                app: this.appointments[i].apps[j]
              }
              client_array.push(obj);
            } else break;
          }
        }
      }
    }

    return client_array;
  }

  async presentAlertConfirm(message) {
    return new Promise(async (resolve, reject) => {
      const alert = await this.alertController.create({
        header: 'Confirm!',
        message: message,
        buttons: [
          {
            text: 'No',
            role: 'cancel',
            cssClass: 'secondary',
            handler: (blah) => {
              resolve(false);
            }
          }, {
            text: 'Yes',
            handler: () => {
              resolve(true);
            }
          }
        ]
      });
  
      await alert.present();
    });  
    
  }

  async presentAlertNotice(message) {
    return new Promise(async (resolve, reject) => {
      const alert = await this.alertController.create({
        header: 'Uh Oh!',
        message: message,
        buttons: [
          {
            text: 'Okay',
            handler: () => {
              resolve(true);
            }
          }
        ]
      });
  
      await alert.present();
    });  
    
  }

  footerExpanded() {
    console.log('Footer expanded!');
  }

  footerCollapsed() {
    console.log('Footer collapsed!');
  }

  toggleFooter() {
    this.footerState = this.footerState == IonPullUpFooterState.Collapsed ? IonPullUpFooterState.Expanded : IonPullUpFooterState.Collapsed;
  }
  
}
