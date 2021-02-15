import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { DbService } from '../services/db.service';
import { StorageService } from '../services/storage.service';
import { GlobalService } from '../services/global.service';
import { ModalController } from '@ionic/angular';
import { UpgradeComponent } from '../modals/upgrade/upgrade.component';
import { AdMob } from '@admob-plus/ionic/ngx';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

  numClients = 0;
  proMode = false;
  adsShowing = false;
  banner;
  constructor(public storage: StorageService, private router: Router, public dbService: DbService, public globalService: GlobalService,
    public modalCtrl: ModalController, private admob: AdMob) {}

  ngOnInit() {}

  async ionViewWillEnter() {
    var loggedIn = await this.storage.getItem("loggedIn");
    if (loggedIn == undefined) {
      this.router.navigate(['/login'], {
        replaceUrl: true
      });
    } else {
      if (!loggedIn.uid) {
        this.router.navigate(['/login'], {
          replaceUrl: true
        }); 
      }
      this.globalService.getObservable().subscribe(async (data) => {
        if (data.key === 'pro') {
          this.proMode = data.value;
          if (this.adsShowing == false && !this.proMode) {
            //showads
            this.setupAds(true);
          } else if (this.proMode) {
            //hideads
            this.setupAds(false);
          }
        }
      })
      this.dbService.uid = loggedIn.uid;
      this.dbService.email = loggedIn.email;
      await this.storage.setupIAP();
      await this.dbService.setupDb();
      await this.dbService.getClients();
      this.numClients = this.storage.clients.length;
    }
  }

  async upgrade() {
    let modal = await this.modalCtrl.create({
      component: UpgradeComponent
    });
    return await modal.present();
  }

  async setupAds(flag) {
    if (flag) {
      await this.admob.start();

      this.banner = new this.admob.BannerAd({
        adUnitId: 'ca-app-pub-xxx/yyy',
      });
      await this.banner.show();
    } else {
      this.banner.hide();
    }
  }
}
