import { Component, OnInit } from '@angular/core';
import { AlertController, ModalController, NavController } from '@ionic/angular';
import { DbService } from 'src/app/services/db.service';
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
  constructor(private dbService: DbService, public modalCtrl: ModalController, private navCtrl: NavController,
    private alertController: AlertController) { }

  async ngOnInit() {
    let type = this.dbService.accountType ? this.dbService.accountType : <any>await this.dbService.getAccountType();
    if (type) this.account = type;
    else {
      this.account = {
        type: 0
      }
    }
    this.templates = <any>await this.dbService.getAllTemplates();
    //this.stylists = <any>await this.dbService.getAllStylists();
  }

  async goBack() {
    this.navCtrl.navigateBack("tabs/tab3", {
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

  async save() {
    this.dbService.saveAccountType(this.account, false);
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
