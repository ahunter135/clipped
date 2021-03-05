import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { DbService } from '../services/db.service';
import { StorageService } from '../services/storage.service';
import { GlobalService } from '../services/global.service';
import { ModalController, Platform } from '@ionic/angular';
import { UpgradeComponent } from '../modals/upgrade/upgrade.component';
import { AdMob } from '@admob-plus/ionic/ngx';
import { AnimationOptions } from 'ngx-lottie';
import { AnimationItem } from 'lottie-web';
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

  options: AnimationOptions = {
    path: '/assets/animations/dog.json',
  };

 
  animationCreated(animationItem: AnimationItem): void {
    
  }
  constructor(public storage: StorageService, private router: Router, public dbService: DbService, public globalService: GlobalService,
    public modalCtrl: ModalController, private admob: AdMob, private platform: Platform) {}

  ngOnInit() {    
  }

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
          console.log("HERE");
          this.dbService.updateAccountPro(this.proMode);
          if (!this.adsShowing && !this.proMode && !this.dbService.bypassPro) {
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
      await this.dbService.getAccountType();
      await this.dbService.getAllAppointments();
      await this.dbService.getAllServices();
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
        adUnitId: this.platform.is('ios') ? 'ca-app-pub-8417638044172769/3111976784' : 'ca-app-pub-8417638044172769/9819843609',
      });
      if (!this.adsShowing) {
        this.adsShowing = true;
        //if (!this.proMode)
        //await this.banner.show();
      }
    } else {
     // await this.banner.hide();
      this.adsShowing = false;
    }
  }
}
