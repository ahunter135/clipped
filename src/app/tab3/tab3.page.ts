import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ModalController, NavController, Platform } from '@ionic/angular';
import { EditAccountComponent } from '../modals/edit-account/edit-account.component';
import { UpgradeComponent } from '../modals/upgrade/upgrade.component';
import { DbService } from '../services/db.service';
import { StorageService } from '../services/storage.service';
import * as introjs from 'intro.js';
import { AnimationOptions } from 'ngx-lottie';
import { AnimationItem } from 'lottie-web';
import { AddStylistComponent } from '../modals/add-stylist/add-stylist.component';
import { AppVersion } from '@awesome-cordova-plugins/app-version/ngx';
import { OneSignal } from '@awesome-cordova-plugins/onesignal/ngx';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {
  darkMode;
  rewarded;
  version = "";
  options: AnimationOptions = {
    path: '/assets/animations/settings.json',
  };

 
  animationCreated(animationItem: AnimationItem): void {

  }
  constructor(public storage: StorageService, private router: Router, public dbService: DbService, private modalCtrl: ModalController, private alertController: AlertController,
     private platform: Platform, private navCtrl: NavController, public appVersion: AppVersion, private onesignal: OneSignal) {

  }

  async ionViewDidEnter() {
    this.darkMode = await this.storage.getItem("darkMode") ? await this.storage.getItem("darkMode") : false;
    this.version = await this.appVersion.getVersionNumber();
  }

  logout() {
    this.storage.clearStorage();
    this.router.navigate(['/login'], {
      replaceUrl: true
    });
  }

  async editAccount() {
    this.storage.modalShown = true;
    let accountModal = await this.modalCtrl.create({
      component: EditAccountComponent
    });
    accountModal.onDidDismiss().then(() => {
      this.storage.modalShown = false;
    })
    return await accountModal.present();
  }

  async upgrade() {
    this.onesignal.addTrigger("timeToUpgrade", true);
  }

  async addToLimit() {
    
    let res = await this.presentAlertConfirm("I know nobody likes Ads. But if you watch this one, we'll increase your client limit by 5! Isn't that great?!");
    if (res) {
      //show ad
      await this.rewarded.show();
    }
  }

  async presentAlertConfirm(message) {
    return new Promise(async (resolve, reject) => {
      const alert = await this.alertController.create({
        header: 'Ad Reward!',
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

  async toggleDarkMode() {
      this.storage.setItem({key: 'darkMode', value: this.darkMode});
      document.body.classList.toggle('dark', this.darkMode);
  }

  async goBack() {
    let url = this.router.url.split('/settings');
    this.navCtrl.navigateBack(url[0], {
      replaceUrl: true
    });
  }
}
