import { Component, OnInit } from '@angular/core';
import { ModalController, NavController } from '@ionic/angular';
import { StorageService } from 'src/app/services/storage.service';
import { AddAppointmentComponent } from '../add-appointment/add-appointment.component';

@Component({
  selector: 'app-select-client',
  templateUrl: './select-client.component.html',
  styleUrls: ['./select-client.component.scss'],
})
export class SelectClientComponent implements OnInit {
  temp = this.storage.clients;
  constructor(public storage: StorageService, private navCtrl: NavController, private modalCtrl: ModalController) { }

  ngOnInit() {}

  async goBack() {
    this.navCtrl.pop();
  }

  async goToApp(client) {
    let modal = await this.modalCtrl.create({
      component: AddAppointmentComponent,
      componentProps: {
        client: client,
        cameFromList: true
      }
    })
    modal.onDidDismiss().then(() => {
      this.goBack();
    });

    await modal.present();
  } 

  search(term) {
    //TODO FIX THIS
    if (term == "" || term == null) {
      this.storage.clients = this.temp;
      return;
    }
    this.storage.clients = [];
    for (let i = 0; i < this.temp.length; i++) {
      if (this.temp[i].name.toLowerCase().includes(term.toLowerCase())) {
        this.storage.clients.push(this.temp[i]);
      }
    }
  }

  resetSearch() {
    this.storage.clients = this.temp;
  }

}
