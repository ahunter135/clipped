import { AdMob } from '@admob-plus/ionic/ngx';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ModalController, Platform } from '@ionic/angular';
import { EditAccountComponent } from '../modals/edit-account/edit-account.component';
import { UpgradeComponent } from '../modals/upgrade/upgrade.component';
import { DbService } from '../services/db.service';
import { StorageService } from '../services/storage.service';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {
  darkMode;
  rewarded;
  
  constructor(public storage: StorageService, private router: Router, public dbService: DbService, private modalCtrl: ModalController, private alertController: AlertController,
    private admob: AdMob, private platform: Platform) {
      document.addEventListener('admob.rewarded.close', async () => {
        await this.rewarded.load();
      })
  }

  async ionViewDidEnter() {
    this.darkMode = await this.storage.getItem("darkMode") ? await this.storage.getItem("darkMode") : false;
    this.rewarded = new this.admob.RewardedAd({
      adUnitId: this.platform.is('ios') ? 'a-app-pub-8417638044172769/1039173753' : 'ca-app-pub-8417638044172769/5761195001'
    });

    await this.rewarded.load();
  }

  logout() {
    this.storage.clearStorage();
    this.router.navigate(['/login'], {
      replaceUrl: true
    });
  }

  async editAccount() {
    let accountModal = await this.modalCtrl.create({
      component: EditAccountComponent
    });

    return await accountModal.present();
  }

  async upgrade() {
    let modal = await this.modalCtrl.create({
      component: UpgradeComponent
    });

    return await modal.present();
    //let proRecipt = await this.storage.upgradeToPro();
  }

  async addToLimit() {
    document.addEventListener('admob.rewarded.reward', async () => {
      // They watched ad, give them prize
      await this.dbService.upgradeClientLimit();
    });
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
}
