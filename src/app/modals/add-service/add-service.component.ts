import { CurrencyPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AlertController, ModalController, NavParams, PickerController } from '@ionic/angular';
import { DbService } from 'src/app/services/db.service';
import { StorageService } from 'src/app/services/storage.service';
import moment from 'moment';
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
    id: '',
    time: <any>{}
  }
  isEdit = false;
  multiColumnOptions = [
    [
      {text:'0 Hours',
      value: 0},
      {text: '1 Hour',
      value: 1},
      {text: '2 Hours',
      value: 2}
    ],
    [
      {text: '0 Minutes',
      value: 0},
      {text: '15 Minutes',
      value: 15},
      {text: '30 Minutes',
      value: 30},
      {text: '45 Minutes',
      value: 45},
    ]
  ]
  chosenTime;
  constructor(public modalCtrl: ModalController, private currency: CurrencyPipe, private dbService: DbService, private navParams: NavParams, private storage: StorageService, private pickerController: PickerController, private alertController: AlertController) { }

  ngOnInit() {
    this.service = this.navParams.data.item ? this.navParams.data.item : {
      name: '',
      price: '0.00',
      time: <any>{}
    };
    if (this.service.time) this.chosenTime = this.service.time.hours.text + " " + this.service.time.minutes.text;
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

  async openPicker(numColumns = 1, numOptions = 5, columnOptions = this.multiColumnOptions){
    const picker = await this.pickerController.create({
      columns: this.getColumns(numColumns, numOptions, columnOptions),
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Confirm',
          handler: (value) => {

            this.service.time = {
              hours: {
                value: value.col0.value,
                text: value.col0.text
              },
              minutes: {
                value: value.col1.value,
                text: value.col1.text
              }
            }
            console.log(this.service.time);
            this.chosenTime = value.col0.text + " " + value.col1.text;
          }
        }
      ]
    });

    await picker.present();
  }

 getColumns(numColumns, numOptions, columnOptions) {
    let columns = [];
    for (let i = 0; i < numColumns; i++) {
      columns.push({
        name: `col${i}`,
        options: this.getColumnOptions(i, numOptions, columnOptions)
      });
    }

    return columns;
  }

 getColumnOptions(columnIndex, numOptions, columnOptions) {
    let options = [];
    for (let i = 0; i < numOptions; i++) {
      if (columnOptions[columnIndex][i % numOptions]) {
        options.push({
          text: columnOptions[columnIndex][i % numOptions].text,
          value: columnOptions[columnIndex][i % numOptions].value
        })
      }
      
    }

    return options;
  }

  async save() {
    let price = this.service.price.replace('$', '');
    if (this.service.name && parseFloat(price) > 0) {
      if (this.isEdit) 
        await this.dbService.editService(this.service);
      else
      await this.dbService.addService(this.service);
      await this.dbService.getAllServices();
      this.modalCtrl.dismiss();
    }
  }

}
