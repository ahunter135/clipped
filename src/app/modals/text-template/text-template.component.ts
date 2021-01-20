import { Component, OnInit } from '@angular/core';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { SMS } from '@ionic-native/sms/ngx';
import { AlertController, ModalController, NavParams, Platform } from '@ionic/angular';
import { DbService } from 'src/app/services/db.service';

@Component({
  selector: 'app-text-template',
  templateUrl: './text-template.component.html',
  styleUrls: ['./text-template.component.scss'],
})
export class TextTemplateComponent implements OnInit {
 
  client;
  text = {
    message: "",
    template: ""
  }
  templates = [];
  constructor(private androidPermissions: AndroidPermissions, private platform: Platform, private sms: SMS, private navParams: NavParams,
    public modalCtrl: ModalController, private alertController: AlertController, private dbService: DbService) { 
    this.client = this.navParams.data.client;
  }

  async ngOnInit() {
    this.templates = <any>await this.dbService.getAllTemplates();
    console.log(this.templates);
  }

  async send() {
    if (!this.text.template) {
      let res = await this.presentAlertConfirm("Would you like to save this text as a template?");
      if (res) {
        this.templates.push(this.text.message);
        await this.dbService.saveTemplate(this.templates);
      }
    }
    let number = this.client.phone_number;
    number = number.replace('-', '');
    if (this.platform.is('android')) {
      this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.SEND_SMS).then(result => {
        if (result.hasPermission) {
          this.sms.send(number, this.text.message).then(() => {
          });
        } else {
          this.androidPermissions.requestPermissions([this.androidPermissions.PERMISSION.SEND_SMS, this.androidPermissions.PERMISSION.BROADCAST_SMS]).then(result => {
            if (result.hasPermission) {
              this.sms.send(number, this.text.message).then(() => {
              });
            }
          })
        }
      })
    } else {
      this.sms.send(number, this.text.message);
    }
  }

  async setMessageText() {
    this.text.message = this.text.template;
  }

  async clear() {
    this.text = {
      message: "",
      template: ""
    }
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
