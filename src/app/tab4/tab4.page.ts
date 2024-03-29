import { Component, ElementRef, ViewChild } from '@angular/core';
import { ActionSheetController, AlertController, LoadingController, ModalController, ToastController } from '@ionic/angular';
import { DbService } from '../services/db.service';
import { StorageService } from '../services/storage.service';
import * as moment from 'moment';
import { ViewAppointmentComponent } from '../modals/view-appointment/view-appointment.component';
import { IonPullUpFooterState } from 'ionic-pullup';
import { ClientByIDPipe } from '../pipes/client-by-id.pipe';
import { GoogleMaps, GoogleMapsEvent, LatLng, MarkerOptions, Marker, GoogleMapsMapTypeId, Geocoder, GoogleMapsAnimation, HtmlInfoWindow, GoogleMapOptions, GoogleMap } from "@ionic-native/google-maps";
import { DatePipe } from '@angular/common';
import { LaunchNavigator, LaunchNavigatorOptions } from '@ionic-native/launch-navigator/ngx';
import { Router } from '@angular/router';
import { AddAppointmentComponent } from '../modals/add-appointment/add-appointment.component';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { Calendar } from '@ionic-native/calendar/ngx';
import {
  CalendarModal,
  CalendarModalOptions,
  DayConfig,
  CalendarResult
} from 'ion2-calendar';
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
  currentFilter = 0;
  ready = false;
  loader;
  customFilterDate;
  constructor(public storage: StorageService, public dbService: DbService, private modalCtrl: ModalController, private clientByID: ClientByIDPipe,
    private datePipe: DatePipe, private actionSheetCtrl: ActionSheetController, private launchNav: LaunchNavigator, private alertController: AlertController,
    private router: Router, private loadingController: LoadingController, private iab: InAppBrowser, private calendar: Calendar, private toastCtrl: ToastController) {
  }

  async ngOnInit() {
  }

  async ionViewWillEnter() {
    await this.dbService.getAllAppointments();
    await this.filterAppointments(this.storage.appointments);
    this.stylists = <any>await this.dbService.getStylists();
    //this.isPro = this.storage.proMode;
  }

  ionViewDidEnter() {
  }

  async showFilter() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Select View',
      cssClass: 'my-custom-class',
      buttons: [{
        text: 'Today',
        handler: async () => {
          this.currentFilter = 0;
          this.filterAppointments(this.storage.appointments);
          return true;
        }
      },
      {
        text: 'Tomorrow',
        handler:async  () => {
          this.currentFilter = 1;
          this.filterAppointments(this.storage.appointments);
          return true;
        }
      }, 
      {
        text: 'Choose A Date',
        handler: async () => {
          await this.presentLoading();
          let config = [];
          for (let i = 0; i < this.storage.appointments.length; i++) {
            let date = moment(this.storage.appointments[i].date);
            config.push({
              date: date.toDate(),
              cssClass: 'unavailableDay'
            });
          }
          actionSheet.dismiss();
          const options: CalendarModalOptions = {
            title: 'Custom Filter',
            color: 'tertiary',
            defaultDate: moment().toDate(),
            defaultScrollTo: moment().toDate(),
            canBackwardsSelected: true,
            closeLabel: 'Close',
            doneLabel: 'Done',
            daysConfig: config
          };
          const myCalendar = await this.modalCtrl.create({
            component: CalendarModal,
            componentProps: {options}
          });
       
          myCalendar.present();
          this.loader.dismiss();
          myCalendar.onDidDismiss().then((event) => {
            if (event.data) {
              const date: CalendarResult = event.data.string;

              this.currentFilter = 2;
              this.customFilterDate = date;
              this.filterAppointments(this.storage.appointments)
            }
            
          });
          
          return true;
        }
      },
      {
        text: 'All Upcoming',
        handler: async () => {
          this.currentFilter = 3;
          this.filterAppointments(this.storage.appointments);
          return true;
        }
      },
      {
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

  async openSettings() {
    this.router.navigate(['/tabs/tab4/settings']);
  }

  async updateApps() {
    this.appointmentsShownOnMap = [];
    this.markers = [];
    this.map.clear();
    //await this.dbService.getAllAppointments();
    //await this.filterAppointments(this.storage.appointments);

    let clients = await this.getClientArrayFromAppointment();
    await this.addMarkers(clients);
  }

  async filterAppointments(appointments) {
    await this.presentLoading();
    let dates = [];
    for (let i = 0; i < appointments.length; i++) {
      let day = moment(appointments[i].date).format("MM/DD/YYYY hh:mm a");
      
      if (this.currentFilter == 0) {
       // Today
       if (moment(day).isSame(moment(), 'days') && moment(day).isSameOrAfter(moment(), 'hours') && moment(day).isSameOrAfter(moment(), 'minutes')) {
          dates.push(moment(day).format("MM/DD/YYYY"));
       }
      } else if (this.currentFilter == 1) {
        // Tomorrow
        let tomorrow = moment().add(1, 'days');
        if (moment(day).isSame(tomorrow, 'days')) {
          dates.push(moment(day).format("MM/DD/YYYY"));
        }
      } else if (this.currentFilter == 2) {
        // Custom Filter Date
        if (moment(day).isSame(moment(this.customFilterDate), 'day')) {
          dates.push(moment(day).format("MM/DD/YYYY"));
        }
      } else if (this.currentFilter == 3) {
        // All Future
        if (moment(day).isSameOrAfter(moment(), 'days') && moment(day).isSameOrAfter(moment(), 'hours') && moment(day).isSameOrAfter(moment(), 'minutes'))
          dates.push(moment(day).format("MM/DD/YYYY"));
      }
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
          if (this.currentFilter == 0) {
            if (moment(day).isSame(now, 'days') && moment(day).isSameOrAfter(now, 'hours') && moment(day).isSameOrAfter(now, 'minutes')) {
                apps[i].apps.push(appointments[j]);
            }
          } else if (this.currentFilter == 1) {
            // Tomorrow
            let tomorrow = moment().add(1, 'days');
            if (moment(day).isSame(tomorrow, 'days')) {
              apps[i].apps.push(appointments[j]);
            }
          } else if (this.currentFilter == 2) {
            //Custom Filter Date
            if (moment(day).isSame(moment(this.customFilterDate), 'day')) {
              apps[i].apps.push(appointments[j]);
            }
          } else if (this.currentFilter == 3) {
            if (moment(day).isSameOrAfter(now, 'days') && moment(day).isSameOrAfter(now, 'hours') && moment(day).isSameOrAfter(now, 'minutes')) 
              apps[i].apps.push(appointments[j]);
          }
        }
      }
    }

    
    this.appointments = apps.sort(this.custom_sort);

    this.tempAppointments = this.appointments;
    if (!this.map)
      await this.addMap();
   else {
      await this.updateApps();
    }
    this.loader.dismiss();
  }

  async presentLoading() {
    this.loader = await this.loadingController.create({
      message: 'Please wait...',
    });
    await this.loader.present();
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
    this.storage.modalShown = true;
    let modal = await this.modalCtrl.create({
      component: ViewAppointmentComponent,
      componentProps: {
        app: item
      }
    })
    modal.onDidDismiss().then((data) => {
      if (data.data) {
        this.editAppointment(data.data);
      }
      this.storage.modalShown = false;
    })
    await modal.present();
  }

  async editAppointment(item) {
    this.storage.modalShown = true;
    let modal = await this.modalCtrl.create({
      component: AddAppointmentComponent,
      componentProps: {
        passedApp: item,
        client: this.clientByID.transform(item.client, 'full'),
        isEdit: true
      }
    })
    modal.onDidDismiss().then(async () => {
      await this.dbService.getAllAppointments();
      await this.filterAppointments(this.storage.appointments);
      this.storage.modalShown = false;
    })
    await modal.present();
  }

  async doRefresh(ev) {
    let apps = await this.dbService.getAllAppointments();
    this.filterAppointments(apps);
    ev.target.complete();
  }

  async addMap(){
    let clients = await this.getClientArrayFromAppointment();
    let latLng;
    let mapOptions: GoogleMapOptions = {};
    if (this.dbService.serviceArea) {
      let results = await Geocoder.geocode( { 'address': this.dbService.serviceArea});
      if (results[0].position) {
        let lat = results[0].position.lat;
        let lng = results[0].position.lng;
        latLng = new LatLng(lat, lng);
        mapOptions = {
          camera: {
            zoom: 10,
            target: latLng,
          },
          controls: {
            mapToolbar: false
          },
          mapType: GoogleMapsMapTypeId.ROADMAP
        }
      } else {
        mapOptions = {
          camera: {
            zoom: 10,
            target: latLng,
          },
          controls: {
            mapToolbar: false
          },
          mapType: GoogleMapsMapTypeId.ROADMAP
        }
        latLng = new LatLng(36.213089, -86.306480);
      }
    } else {
      latLng = new LatLng(36.213089, -86.306480);
      mapOptions = {
        camera: {
          zoom: 10,
          target: latLng,
        },
        controls: {
          mapToolbar: false
        },
        mapType: GoogleMapsMapTypeId.ROADMAP
      }
    }
    
    this.map = GoogleMaps.create(this.mapElement.nativeElement, mapOptions);

    this.map.one(GoogleMapsEvent.MAP_READY).then(async () => {
      await this.addMarkers(clients);
    })
    
    this.map.on(GoogleMapsEvent.CAMERA_MOVE_END).subscribe(() => {
      if (!this.ready) return;
      this.appointmentsShownOnMap = [];
      //Bounds are set, see if any markers are here.
      for (let i = 0; i < this.markers.length; i++) {
        //let region = this.map.getVisibleRegion();
        //if (region.contains(this.markers[i].getPosition())) {
          let client = this.markers[i].get('client');

          this.appointmentsShownOnMap.push(client)
       // }
      }

      this.appointmentsShownOnMap = this.appointmentsShownOnMap.sort(this.custom_sort_map);
    })
  }

  async addMarkers(clients) {
    this.appointmentsShownOnMap = [];
    this.ready = false;
    for (let i = 0; i < clients.length; i++) {
      await this.addMarker(clients[i]);
    }
    this.ready = true;
  }

  async addMarker(client){
    if (client.location && client.location.address) {
      let address = client.location.address + " " + client.location.zip;
      let results = await Geocoder.geocode( { 'address': address});
      let lat, lng;
      if (results[0]) {
        lat = results[0].position.lat;
        lng = results[0].position.lng;
      } else {
        return;
      }
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
        visible: this.isLocationFree(latLng),
        title: this.clientByID.transform(client.client_id).toString(),
        snippet: client.location.address + (client.location.address2 ? (", " +  client.location.address2) : "") + " - " + this.datePipe.transform(client.app.date, 'mediumDate') + " @ " + this.datePipe.transform(client.app.date, 'shortTime')
      }).then((marker:Marker) => {
        marker.set('client', client);
        marker.set('pet', client.app.pet ? JSON.stringify(client.app.pet) : null);
        marker.set('latlng', latLng);
        this.markers.push(marker);
        if (this.markers.length == 1) {
          this.map.animateCamera({
            zoom: 10,
            target: marker.getPosition()
          })
        }

        //let region = this.map.getVisibleRegion();
        //if (region.contains(marker.getPosition())) {
          this.appointmentsShownOnMap.push(client)
        //}
        
        this.appointmentsShownOnMap = this.appointmentsShownOnMap.sort(this.custom_sort_map);

        marker.on(GoogleMapsEvent.MARKER_CLICK).subscribe(() => {
          this.openSheet(marker.get('client'));
        })
      })
    } else {
      let toast = await this.toastCtrl.create({
        message: "If your client does not have an address, their appointment will not show up here. Be sure each client has an address!",
        duration: 7500,
        buttons: [
          {
            text: 'Close',
            role: 'cancel',
            handler: () => {
              console.log('Cancel clicked');
            }
          }
        ]
      })

      toast.present();
    };
  }

  isLocationFree(search) {
    for (var i = 0, l = this.markers.length; i < l; i++) {
      if (this.markers[i].get('latlng').lat == search.lat && this.markers[i].get('latlng').lng == search.lng) {
        return false;
      }
    }
    return true;
  }

  async openSheet(client) {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Appointment Options',
      cssClass: 'my-custom-class',
      buttons: [{
        text: 'Navigate To',
        icon: (this.storage.proMode || this.dbService.bypassPro) ? 'navigate' : 'lock-closed-outline',
        handler: () => {
          if (!this.storage.proMode && !this.dbService.bypassPro) {
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
          this.storage.modalShown = true;
          const modal = await this.modalCtrl.create({
            component: ViewAppointmentComponent,
            componentProps: {
              app: client.app
            }
          });
          modal.onDidDismiss().then((data) => {
            if (data.data) {
              this.editAppointment(data.data);
            }
            this.storage.modalShown = false;
          })
          return await modal.present();
        }
      }, 
      {
        text: 'Call',
        icon: (this.storage.proMode || this.dbService.bypassPro) ? 'call' : 'lock-closed-outline',
        handler:async  () => {
          let phone = this.clientByID.transform(client.client_id, 'phone');
            if (!this.storage.proMode && !this.dbService.bypassPro) {
              await this.presentAlertNotice("You will need to upgrade to Pro to use this feature!");
              return;
            }
            let res = await this.presentAlertConfirm("Are you sure you would like to call " + phone);
            if (res)
              this.iab.create('tel:'+  phone, '_system');
          
        }
      }, 
      {
        text: 'Delete',
        role: 'destructive',
        icon: 'trash',
        handler: async () => {
          this.presentAlertConfirm("Are you sure you want to delete this appointment?").then(async (res) => {
            if (res) {
              console.log(client);
              if (client.app.calendarEventId) this.calendar.deleteEventById(client.app.calendarEventId);
              if (client.app.isReoccurring) {
                let res = await this.presentAlertConfirm("This appointment is reoccurring. Would you like to delete all future appointments as well?");
                if (res) {
                  await this.dbService.deleteAppointmentandRecurrences(client.app);
                } else {
                  await this.dbService.deleteAppointment(client);
                }
              } else {
                await this.dbService.deleteAppointment(client);
              }
              await this.dbService.getAllAppointments();
              await this.filterAppointments(this.storage.appointments);
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

  async addApp() {
    this.router.navigate(["tabs/tab4/select-client"]);
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
