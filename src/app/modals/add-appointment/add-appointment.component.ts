import { CurrencyPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams, Platform } from '@ionic/angular';
import * as moment from 'moment';
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
  app_date;
  app_time;
  client;
  stylist;
  stylists = [];
  pet;
  service;
  pets = [];
  customService = <any>{
    price: '$0.00',
    name: ''
  };
  constructor(public modalCtrl: ModalController, private navParams: NavParams, private db: DbService, public storage: StorageService, private platform: Platform,
    private currency: CurrencyPipe, private dbService: DbService) {
    this.client = this.navParams.data.client;
  }

  async ngOnInit() {
    this.stylists = <any>await this.db.getStylists();
    for (let i = 0; i < this.client.pets.length; i++) {
      if (this.client.pets[i].isActive || this.client.pets[i].isActive == undefined)
        this.pets.push(this.client.pets[i]);
    }
  }

  onChange($event) {
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
      pet: this.pet,
      client: this.client.id,
      //stylist: this.stylist ? this.stylist : null,
      service: {}
    }
    if (this.service == 0) {
      await this.dbService.addService(this.customService);
      obj.service = this.customService
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
