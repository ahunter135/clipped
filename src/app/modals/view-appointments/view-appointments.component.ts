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
  currentView = "0";
  constructor(private storage: StorageService, private navParams: NavParams, private modalCtrl: ModalController) { }

  ngOnInit() {
    this.getApps();
  }

  getApps() {
    let appointments = this.storage.appointments;
    this.appointments = [];
    this.client = this.navParams.data.client;
    for (let i = 0; i < appointments.length; i++) {
      let appDate = moment(appointments[i].date);
      if (this.currentView == "0") {
        if (appointments[i].client == this.client.id && appDate.isSameOrBefore(moment(), 'days') && appDate.isSameOrBefore(moment(), 'hours') && appDate.isSameOrBefore(moment(), 'minutes')) {
          this.appointments.push(appointments[i]);
        }
      } else {
        if (appointments[i].client == this.client.id && appDate.isSameOrAfter(moment())) {
          this.appointments.push(appointments[i]);
        }
      } 
    }

    this.appointments = this.appointments.sort(this.custom_sort);
    if (this.currentView == "1") {
      this.appointments.reverse();
    }
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
