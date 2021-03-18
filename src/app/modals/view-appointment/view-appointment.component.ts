import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-view-appointment',
  templateUrl: './view-appointment.component.html',
  styleUrls: ['./view-appointment.component.scss'],
})
export class ViewAppointmentComponent implements OnInit {
  app = <any>{
    summary: '',
    date: '',
    client: '',
    stylist: '',
    service: <any>{},
    pet: '',
    address: '',
    address2: ''
  };
  constructor(public modalCtrl: ModalController, public navParams: NavParams, private storage: StorageService) {
    this.app = this.navParams.data.app;
  }

  ngOnInit() {
    for (let i = 0; i < this.storage.services.length; i++) {
      if (this.storage.services[i].id == this.app.service) {
        this.app.service = this.storage.services[i];
        break;
      }
    }
  }

  edit() {
    let appointmentObj = {
      date: this.app.date,
      pet: this.app.pet,
      service: this.app.service.id,
      client: this.app.client,
      app: this.app
    }
    this.modalCtrl.dismiss(appointmentObj);
  }

}
