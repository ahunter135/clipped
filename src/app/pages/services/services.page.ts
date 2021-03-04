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

  async ionViewWillEnter() {
    await this.dbService.getAllServices();
  }

  async goBack() {
    this.navCtrl.pop();
  }

  async add() {
    const modal = await this.modalCtrl.create({
      component: AddServiceComponent,
      componentProps: {
        isEdit: false
      }
    })

    modal.onDidDismiss().then(async (data) => {
      await this.dbService.getAllServices();
    })

    return await modal.present();
  }

  async editService(item) {
    const modal = await this.modalCtrl.create({
      component: AddServiceComponent,
      componentProps: {
        item: item,
        isEdit: true
      }
    })

    modal.onDidDismiss().then(async (data) => {
      await this.dbService.getAllServices();
    })

    return await modal.present();
  }

}
