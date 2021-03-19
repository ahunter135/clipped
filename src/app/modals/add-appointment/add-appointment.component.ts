import { CurrencyPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams, Platform } from '@ionic/angular';
import { CalendarComponentOptions } from 'ion2-calendar';
import * as moment from 'moment-timezone';
import { DbService } from 'src/app/services/db.service';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-add-appointment',
  templateUrl: './add-appointment.component.html',
  styleUrls: ['./add-appointment.component.scss'],
})
export class AddAppointmentComponent implements OnInit {
  max = moment().add(2, 'y').format("YYYY-MM-DD");
  today = moment().format("YYYY-MM-DD");
  min = moment().format("YYYY-MM-DD");
  type: 'string';
  app_date = moment().format("YYYY-MM-DD");
  app_time;
  client;
  stylist;
  stylists = [];
  pet = [];
  service;
  pets = [];
  calendarOptions: CalendarComponentOptions;
  appointments = [];
  customService = <any>{
    price: '$0.00',
    name: ''
  };
  expanded = false;
  bookingsOnDay = [];
  passedApp;
  isEdit = false;
  constructor(public modalCtrl: ModalController, private navParams: NavParams, private db: DbService, public storage: StorageService, private platform: Platform,
    private currency: CurrencyPipe, private dbService: DbService) {
    this.client = this.navParams.data.client;
    this.passedApp = this.navParams.data.passedApp;
    this.isEdit = this.navParams.data.isEdit ? true : false;
  }

  async ngOnInit() {
    this.stylists = <any>await this.db.getStylists();
    await this.dbService.getAllServices();
    for (let i = 0; i < this.client.pets.length; i++) {
      if (this.client.pets[i].isActive || this.client.pets[i].isActive == undefined)
        this.pets.push(this.client.pets[i]);
    }
    if (this.passedApp) {
      this.storage.services.forEach(service => {
        if (service.id == this.passedApp.service) {
          this.service = service.id;
        }
      })

      let obj = [];
      for (let i = 0; i < this.pets.length; i++) {
        if (this.passedApp.pet.name) {
          if (this.passedApp.pet.name.includes(this.pets[i].name)) {
            obj.push(this.pets[i]);
          }
        } else {
          if (this.passedApp.pet.includes(this.pets[i].name)) {
            obj.push(this.pets[i]);
          }
        }
      }
      this.pet = obj;

      if (this.isEdit) {
        this.app_date = moment(this.passedApp.date).format("YYYY-MM-DD");
        this.app_time = this.passedApp.date;
      }
    } else
      this.pet = [this.pets[0]];
    await this.dbService.getAllAppointments();
    this.appointments = this.storage.appointments;
    let config = [];
    for (let i = 0; i < this.appointments.length; i++) {
      let date = moment(this.appointments[i].date);
      config.push({
        date: date.toDate(),
        cssClass: 'unavailableDay'
      });

      if (date.isSame(this.app_date, 'days')) {
        this.bookingsOnDay.push(this.appointments[i]);
      }
    }

    this.calendarOptions = {
      daysConfig: config,
      from: new Date(2010, 0, 1)
    }
  }

  expandItem(): void {
    this.expanded = !this.expanded;
  }

  onChange($event) {
    this.bookingsOnDay = [];
    for (let i = 0; i < this.appointments.length; i++) {
      let date = moment(this.appointments[i].date);
      if (date.isSame(moment(this.app_date), 'days')) {
        this.bookingsOnDay.push(this.appointments[i]);
      }
    }
  }

  async submit() {
    let petObjs = {
      name: "",
      image: false
    };
    for (let i = 0; i < this.pet.length; i++) {
      for (let j = 0; j < this.pets.length; j++) {
        if (this.pet[i].name == this.pets[j].name) {
          petObjs.name += this.pets[j].name + ", ";
          if (this.pets[j].image) petObjs.image = this.pets[j].image;
          break;
        }
      }
    }
    petObjs.name = petObjs.name.substring(0, petObjs.name.length - 2);

    let chosenDate = moment(this.app_date).format("MM/DD/YYYY");
    let time = moment(this.app_time).format("hh:mm a");
    let appointmentDate = moment(chosenDate + " " + time).toISOString();
    if (!this.app_date || !this.app_time || !this.pet || !this.service) {
      return;
    }
    let obj = <any>{
      date: appointmentDate,
      timezone: moment.tz.guess(),
      pet: petObjs,
      client: this.client.id,
      service: <any>{},
      deleted: false,
      cancelled: false,
      confirmed: false
    }
    if (this.service == 0) {
      obj.service = await this.dbService.addService(this.customService);
    } else obj.service = this.service
    
    if (!this.isEdit) this.db.addClientAppointment(obj);
    else { 
      obj.app = this.passedApp.app;
      this.db.editClientAppointment(obj);
    }
    this.modalCtrl.dismiss();
  }

  formatPrice(ev) {
    let amount = this.currency.transform(this.customService.price, '$');

    this.customService.price = amount.toString();
  }

  erasePrice() {
    this.customService.price = "";
  }
}
