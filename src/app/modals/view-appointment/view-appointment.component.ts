import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';

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
    stylist: ''
  };
  constructor(public modalCtrl: ModalController, public navParams: NavParams) {
    this.app = this.navParams.data.app;
  }

  ngOnInit() {
    console.log(this.app);
  }

}
