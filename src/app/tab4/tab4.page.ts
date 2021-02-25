import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { DbService } from '../services/db.service';
import { StorageService } from '../services/storage.service';
import * as moment from 'moment';
import { ClientByIDPipe } from '../pipes/client-by-id.pipe';
import { ViewAppointmentComponent } from '../modals/view-appointment/view-appointment.component';

@Component({
  selector: 'app-tab4',
  templateUrl: 'tab4.page.html',
  styleUrls: ['tab4.page.scss']
})
export class Tab4Page {
  darkMode;
  appointments;
  constructor(public storage: StorageService, public dbService: DbService, private modalCtrl: ModalController) {
  }

  async ngOnInit() {
    let apps = await this.dbService.getAllAppointments();
    this.filterAppointments(apps);
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
  
}
