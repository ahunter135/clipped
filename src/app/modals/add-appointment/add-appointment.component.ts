import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import * as moment from 'moment';
import { DbService } from 'src/app/services/db.service';

@Component({
  selector: 'app-add-appointment',
  templateUrl: './add-appointment.component.html',
  styleUrls: ['./add-appointment.component.scss'],
})
export class AddAppointmentComponent implements OnInit {
  max = moment().add(2, 'y').format("YYYY-MM-DD");
  today = moment().format("YYYY-MM-DD");
  min = moment().format("YYYY-MM-DD")
  summary;
  app_date;
  client;
  constructor(public modalCtrl: ModalController, private navParams: NavParams, private db: DbService) {
    this.client = this.navParams.data.client;
    console.log(this.max);
  }

  ngOnInit() {}

  submit() {
    if (!this.app_date || !this.summary) {
      return;
    }
    let obj = {
      date: this.app_date,
      summary: this.summary,
      client: this.client.id
    }
    this.db.addClientAppointment(obj);
    this.modalCtrl.dismiss();
  }
}
