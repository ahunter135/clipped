import { Component, OnInit } from '@angular/core';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { SMS } from '@awesome-cordova-plugins/sms/ngx';
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
    let number = this.client.phone_number;
    number = number.replace('-', '');
      this.sms.send(number, this.text.message, {android: { intent: 'INTENT' }});
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
