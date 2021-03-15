import { CurrencyPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AlertController, ModalController, NavParams } from '@ionic/angular';
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
  constructor(public modalCtrl: ModalController, private currency: CurrencyPipe, private dbService: DbService, private navParams: NavParams, private storage: StorageService, private alertController: AlertController) { }

  ngOnInit() {
    this.service = this.navParams.data.item ? this.navParams.data.item : {
      name: '',
      price: '0.00'
    };
    this.isEdit = this.navParams.data.isEdit;
  }

  formatPrice(ev) {
    let amount = this.currency.transform(this.service.price, '$');

    this.service.price = amount.toString();
  }

  async delete() {
    let res = await this.presentAlertConfirm("Are you sure you would like to delete this client?");
    if (!res) {
      return;
    };
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

  erasePrice() {
    if (!this.isEdit) this.service.price = "";
  }

  async presentAlertConfirm(message) {
    return new Promise(async (resolve, reject) => {
      const alert = await this.alertController.create({
        header: 'Confirm!',
        message: message,
        buttons: [
          {
            text: 'No',
            role: 'cancel',
            cssClass: 'secondary',
            handler: (blah) => {
              resolve(false);
            }
          }, {
            text: 'Yes',
            handler: () => {
              resolve(true);
            }
          }
        ]
      });
  
      await alert.present();
    });  
    
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
