import { CurrencyPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { DbService } from 'src/app/services/db.service';

@Component({
  selector: 'app-add-service',
  templateUrl: './add-service.component.html',
  styleUrls: ['./add-service.component.scss'],
})
export class AddServiceComponent implements OnInit {
  service = {
    name: '',
    price: '0.00',
    details: ''
  }
  isEdit = false;
  constructor(public modalCtrl: ModalController, private currency: CurrencyPipe, private dbService: DbService, private navParams: NavParams) { }

  ngOnInit() {
    this.service = this.navParams.data.item ? this.navParams.data.item : {
      name: '',
      price: '0.00'
    };
    this.isEdit = this.navParams.data.isEdit;
  }

  formatPrice(ev) {
    let amount = this.currency.transform(this.service.price, '$');

    this.service.price = amount;
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
