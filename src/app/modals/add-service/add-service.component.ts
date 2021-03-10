import { CurrencyPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams, Platform } from '@ionic/angular';
import { DbService } from 'src/app/services/db.service';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-add-service',
  templateUrl: './add-service.component.html',
  styleUrls: ['./add-service.component.scss'],
})
export class AddServiceComponent implements OnInit {
  service = {
    name: '',
    price: '0.00',
    details: '',
    id: ''
  }
  isEdit = false;
  constructor(public modalCtrl: ModalController, private currency: CurrencyPipe, private dbService: DbService, private navParams: NavParams, private storage: StorageService, private platform: Platform) { }

  ngOnInit() {
    this.service = this.navParams.data.item ? this.navParams.data.item : {
      name: '',
      price: '0.00'
    };
    this.isEdit = this.navParams.data.isEdit;
    this.platform.backButton.subscribeWithPriority(10, () => {
      this.modalCtrl.dismiss();
    });
  }

  ionViewWillLeave() {
    this.platform.backButton.unsubscribe();
  }

  formatPrice(ev) {
    let amount = this.currency.transform(this.service.price, '$');

    this.service.price = amount;
  }

  async delete() {
    console.log(this.storage.services);
    let id = '';
    for (let i = 0; i < this.storage.services.length; i++) {
      if (this.storage.services[i].id == this.service.id) {
        id = this.service.id;
        break;
      }
    }

    await this.dbService.deleteService(id);
    this.modalCtrl.dismiss();
  }

  async save() {
    let price = this.service.price.replace('$', '');
    if (this.service.name && parseFloat(price) > 0) {
      if (this.isEdit) 
        await this.dbService.editService(this.service);
      else
      await this.dbService.addService(this.service);
      this.modalCtrl.dismiss();
    }
  }

}
