import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ModalController, NavController } from '@ionic/angular';
import { DbService } from 'src/app/services/db.service';
import { StorageService } from 'src/app/services/storage.service';
import { AddStylistComponent } from '../add-stylist/add-stylist.component';
import { TextTemplateComponent } from '../text-template/text-template.component';

@Component({
  selector: 'app-edit-account',
  templateUrl: './edit-account.component.html',
  styleUrls: ['./edit-account.component.scss'],
})
export class EditAccountComponent implements OnInit {
  name = this.dbService.name != "" ? this.dbService.name : null;
  email = this.dbService.email;
  account = <any>{};
  remindersOn = false;
  reminderFrequency = "15";
  isPro = this.storage.proMode;
  constructor(public dbService: DbService, public modalCtrl: ModalController, private navCtrl: NavController,
    private alertController: AlertController, private storage: StorageService) { }

  async ngOnInit() {
    let type = this.dbService.accountType ? this.dbService.accountType : <any>await this.dbService.getAccountType();
    this.reminderFrequency = this.dbService.reminders.frequency;
    this.remindersOn = false;//this.isPro ? this.dbService.reminders.on : false;
    if (type) this.account = type;
    else {
      this.account = {
        type: 0
      }
    }
  }

  async goBack() {
    this.modalCtrl.dismiss();
  }

  async changeEmail() {}

  async save() {
    this.dbService.saveAccountType(0, false, {
      on: false,
      frequency: "60"
    });
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
}
