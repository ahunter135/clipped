import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-view-appointment',
  templateUrl: './view-appointment.component.html',
  styleUrls: ['./view-appointment.component.scss'],
})
export class ViewAppointmentComponent implements OnInit {
  app = {
    summary: '',
    date: '',
    client: '',
    stylist: '',
    service: <any>{},
    pet: ''
  };
  constructor(public modalCtrl: ModalController, public navParams: NavParams, private storage: StorageService) {
    this.app = this.navParams.data.app;
  }

  ngOnInit() {
    console.log(this.app.service);
    for (let i = 0; i < this.storage.services.length; i++) {
      if (this.storage.services[i].id == this.app.service) {
        this.app.service = this.storage.services[i];
        break;
      }
    }
    console.log(this.app.service);
  }

}
