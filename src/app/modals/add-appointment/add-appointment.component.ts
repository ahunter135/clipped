import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
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
  min = moment().format("YYYY-MM-DD")
  app_date;
  client;
  stylist;
  stylists = [];
  pet;
  service;
  constructor(public modalCtrl: ModalController, private navParams: NavParams, private db: DbService, public storage: StorageService) {
    this.client = this.navParams.data.client; 
  }

  async ngOnInit() {this.stylists = <any>await this.db.getStylists();}

  submit() {
    if (!this.app_date || !this.pet || !this.service) {
      return;
    }
    let obj = {
      date: this.app_date,
      pet: this.pet,
      client: this.client.id,
      stylist: this.stylist ? this.stylist : null,
      service: this.service
    }
    this.db.addClientAppointment(obj);
    this.modalCtrl.dismiss();
  }
}
