import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { DbService } from '../services/db.service';
import { StorageService } from '../services/storage.service';
import * as moment from 'moment';
import { ClientByIDPipe } from '../pipes/client-by-id.pipe';

@Component({
  selector: 'app-tab4',
  templateUrl: 'tab4.page.html',
  styleUrls: ['tab4.page.scss']
})
export class Tab4Page {
  darkMode;
  appointments;
  constructor(public storage: StorageService, public dbService: DbService) {
  }

  async ngOnInit() {
    let apps = await this.dbService.getAllAppointments();
    this.filterAppointments(apps);
  }

  filterAppointments(appointments) {
    let dates = [];
    for (let i = 0; i < appointments.length; i++) {
      let day = moment(appointments[i].date);
      if (day.isAfter(moment()))
        dates.push(day.format("MM/DD/YYYY"));
    }

    let uniqueDates = Array.from(new Set(dates));

    let apps = [];
    for (let i = 0; i < uniqueDates.length; i++) {
      apps.push({date: uniqueDates[i], apps: []})
      for (let j = 0; j < appointments.length; j++) {
        if (moment(appointments[j].date).format("MM/DD/YYYY") == uniqueDates[i]) {
          apps[i].apps.push(appointments[j]);
        }
      }
    }

    this.appointments = apps;
  }

  async doRefresh(ev) {
    let apps = await this.dbService.getAllAppointments();
    this.filterAppointments(apps);
    ev.target.complete();
  }
  
}
