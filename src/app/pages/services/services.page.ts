import { Component, OnInit } from '@angular/core';
import { ModalController, NavController } from '@ionic/angular';
import { AddServiceComponent } from 'src/app/modals/add-service/add-service.component';
import { DbService } from 'src/app/services/db.service';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-services',
  templateUrl: './services.page.html',
  styleUrls: ['./services.page.scss'],
})
export class ServicesPage implements OnInit {

  constructor(private navCtrl: NavController, private modalCtrl: ModalController, public storage: StorageService, private dbService: DbService) { }

  ngOnInit() {
  }

  async goBack() {
    this.navCtrl.pop();
  }

  async add() {
    this.storage.modalShown = true;
    const modal = await this.modalCtrl.create({
      component: AddServiceComponent,
      componentProps: {
        isEdit: false
      }
    })

    modal.onDidDismiss().then(async (data) => {
      await this.dbService.getAllServices();
      this.storage.modalShown = false;
    })

    return await modal.present();
  }

  async editService(item) {
    this.storage.modalShown = true;
    const modal = await this.modalCtrl.create({
      component: AddServiceComponent,
      componentProps: {
        item: item,
        isEdit: true
      }
    })

    modal.onDidDismiss().then(async (data) => {
      await this.dbService.getAllServices();
      this.storage.modalShown = false;
    })

    return await modal.present();
  }

}
