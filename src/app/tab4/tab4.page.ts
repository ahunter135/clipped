import { Component, ElementRef, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { DbService } from '../services/db.service';
import { StorageService } from '../services/storage.service';
import * as moment from 'moment';
import { ViewAppointmentComponent } from '../modals/view-appointment/view-appointment.component';
import { IonPullUpFooterState } from 'ionic-pullup';
import { ClientByIDPipe } from '../pipes/client-by-id.pipe';
import { GoogleMaps, GoogleMapsEvent, LatLng, MarkerOptions, Marker, GoogleMapsMapTypeId, Geocoder, GoogleMapsAnimation, HtmlInfoWindow, GoogleMapOptions, GoogleMap } from "@ionic-native/google-maps";

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
  constructor(public storage: StorageService, public dbService: DbService, private modalCtrl: ModalController, private clientByID: ClientByIDPipe) {
  }

  async ngOnInit() {
  }

  async ionViewWillEnter() {
    let apps = await this.dbService.getAllAppointments();
    this.filterAppointments(apps);
    this.stylists = <any>await this.dbService.getStylists();
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
        target: latLng
      },
      mapType: GoogleMapsMapTypeId.ROADMAP
    }

    this.map = GoogleMaps.create('map', mapOptions);

    this.addMarkers(clients);
    
    this.map.on(GoogleMapsEvent.CAMERA_MOVE_END).toPromise().then(() => {
      this.appointmentsShownOnMap = [];
      //Bouunds are set, see if any markers are here.
      for (let i = 0; i < this.markers.length; i++) {
        let region = this.map.getVisibleRegion();
        if (region.contains(this.markers[i].getPosition())) {
          let client = this.markers[i].client;
          this.appointmentsShownOnMap.push(client)
        }
      }
    })
    
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
    
  }

  addMarkers(clients) {
    this.markers = [];
    for (let i = 0; i < clients.length; i++) {
      this.addMarker(clients[i]);
    }
  }

  async addMarker(client){
    let address = client.location.address + " " + client.location.zip;
    let results = await Geocoder.geocode( { 'address': address});
    console.log(results);
    let lat = results[0].position.lat;
    let lng = results[0].position.lng;

    let latLng = new LatLng(lat, lng);
    
    let marker = new Marker(this.map, {});
    marker.setPosition(latLng);

    this.markers.push(marker);

    // Add button to this view
    let clientName = this.clientByID.transform(client.client_id);
    let content = "<p>"+clientName+"</p>";          
    let infoWindow = new HtmlInfoWindow();
    infoWindow.setContent(content);

    marker.on(GoogleMapsEvent.MARKER_CLICK).toPromise().then(() => {
      infoWindow.open(marker);
    })
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

  segmentChanged(ev) {
    this.view = ev.detail.value;
    setTimeout(() => {
      if (this.view == 'map') this.addMap();
    }, 2000);
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
