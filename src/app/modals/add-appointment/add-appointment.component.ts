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
  app_date = moment().format("MM-DD-YYYY");
  app_time;
  client;
  stylist;
  stylists = [];
  pet;
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
  constructor(public modalCtrl: ModalController, private navParams: NavParams, private db: DbService, public storage: StorageService, private platform: Platform,
    private currency: CurrencyPipe, private dbService: DbService) {
    this.client = this.navParams.data.client;

  }

  async ngOnInit() {
    this.stylists = <any>await this.db.getStylists();
    await this.dbService.getAllServices();
    for (let i = 0; i < this.client.pets.length; i++) {
      if (this.client.pets[i].isActive || this.client.pets[i].isActive == undefined)
        this.pets.push(this.client.pets[i]);
    }
    this.pet = this.pets[0].name;
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
    let chosenDate = moment(this.app_date).format("MM/DD/YYYY");
    let time = moment(this.app_time).format("hh:mm a");
    let appointmentDate = moment(chosenDate + " " + time).toISOString();
    if (!this.app_date || !this.app_time || !this.pet || !this.service) {
      return;
    }
    let obj = {
      date: appointmentDate,
      timezone: moment.tz.guess(),
      pet: this.pet,
      client: this.client.id,
      service: <any>{},
      deleted: false,
      cancelled: false,
      confirmed: false
    }
    if (this.service == 0) {
      obj.service = await this.dbService.addService(this.customService);
    } else obj.service = this.service
    
    this.db.addClientAppointment(obj);
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
