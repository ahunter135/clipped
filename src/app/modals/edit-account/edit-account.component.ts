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

  account = <any>{};
  state = "home";
  templates = [];
  stylists = [];
  remindersOn = false;
  reminderFrequency = "15";
  isPro = this.storage.proMode;
  constructor(private dbService: DbService, public modalCtrl: ModalController, private navCtrl: NavController,
    private alertController: AlertController, private router: Router, private storage: StorageService) { }

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
    this.templates = <any>await this.dbService.getAllTemplates();
  }

  async goBack() {
    let url = this.router.url.split('/edit-account');
    this.navCtrl.navigateBack(url[0], {
      replaceUrl: true
    });
  }

  async editTextTemplates() {
    this.state = "edit-templates";
  }

  async editStylists() {
    let modal = await this.modalCtrl.create({
      component: AddStylistComponent
    });

    return await modal.present();
  }

  async addStylist() {
    
  }

  async editServices() {
    this.router.navigate(['/services']);
  }

  async save() {
    this.dbService.saveAccountType(this.account, false, {on: this.remindersOn, frequency: this.reminderFrequency});
    await this.modalCtrl.dismiss();
  }

  async remove(index) {
    let res = await this.presentAlertConfirm("Are you sure you would like to delete this template");
    if (res) {
      this.templates.splice(index, 1);
      this.dbService.saveTemplate(this.templates);
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
