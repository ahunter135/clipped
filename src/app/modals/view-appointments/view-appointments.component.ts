import { Component, OnInit } from '@angular/core';
import { StorageService } from 'src/app/services/storage.service';
import moment from 'moment';
import { ModalController, NavParams } from '@ionic/angular';

@Component({
  selector: 'app-view-appointments',
  templateUrl: './view-appointments.component.html',
  styleUrls: ['./view-appointments.component.scss'],
})
export class ViewAppointmentsComponent implements OnInit {
  client;
  appointments = [];
  constructor(private storage: StorageService, private navParams: NavParams, private modalCtrl: ModalController) { }

  ngOnInit() {
    let appointments = this.storage.appointments;
    this.client = this.navParams.data.client;
    for (let i = 0; i < appointments.length; i++) {
      let appDate = moment(appointments[i].date);
      if (appointments[i].client == this.client.id && appDate.isSameOrBefore(moment(), 'days') && appDate.isSameOrBefore(moment(), 'hours') && appDate.isSameOrBefore(moment(), 'minutes')) {
        this.appointments.push(appointments[i]);
      }
    }

    console.log(this.appointments);
    this.appointments = this.appointments.sort(this.custom_sort);

  }

  goBack() {
    this.modalCtrl.dismiss();
  }

  bookAgain(app) {
    this.modalCtrl.dismiss(app);
  }

  custom_sort(a, b) {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  }

}
