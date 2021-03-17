import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OneSignal } from '@ionic-native/onesignal/ngx';
import { AlertController, ModalController, NavController, Platform } from '@ionic/angular';
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
  notifications = false;
  notificationsFrequency = "15";
  constructor(public dbService: DbService, public modalCtrl: ModalController, private navCtrl: NavController,
    private alertController: AlertController, private storage: StorageService, private onesignal: OneSignal,
    private platform: Platform) { }

  async ngOnInit() {
    let type = this.dbService.accountType ? this.dbService.accountType : <any>await this.dbService.getAccountType();
    this.reminderFrequency = this.dbService.reminders.frequency;
    this.remindersOn = false;//this.isPro ? this.dbService.reminders.on : false;
    this.notifications = this.dbService.reminders.notifications ? this.dbService.reminders.notifications : false;
    this.notificationsFrequency = this.dbService.reminders.notificationsFrequency ? this.dbService.reminders.notificationsFrequency : '15';
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
    let id = {
      userId: 'string',
      pushToken: 'string'
    };
    if (this.platform.is('android') || this.platform.is('ios'))
      id = await this.onesignal.getIds();

    this.dbService.saveAccountType(0, false, {
      on: false,
      frequency: "60",
      notifications: this.notifications,
      notificationsFrequency: this.notificationsFrequency,
      id: id
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
