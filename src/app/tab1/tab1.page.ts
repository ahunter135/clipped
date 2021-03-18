import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { DbService } from '../services/db.service';
import { StorageService } from '../services/storage.service';
import { GlobalService } from '../services/global.service';
import { ModalController, NavController, Platform } from '@ionic/angular';
import { UpgradeComponent } from '../modals/upgrade/upgrade.component';
import { AdMob } from '@admob-plus/ionic/ngx';
import { AnimationOptions } from 'ngx-lottie';
import { AnimationItem } from 'lottie-web';
import { AddStylistComponent } from '../modals/add-stylist/add-stylist.component';
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
    public modalCtrl: ModalController, private admob: AdMob, private platform: Platform, private navCtrl: NavController) {}

  ngOnInit() {
    this.platform.backButton.subscribeWithPriority(998, () => {
      console.log('2');
      this.navCtrl.pop();
      return;
    });

    this.platform.backButton.subscribeWithPriority(999, (processNextHandler) => {
      console.log('1');
      if (this.storage.modalShown) {
        this.modalCtrl.dismiss();
        this.storage.modalShown = false;
      } else {
        processNextHandler();
      }
      return;
    });
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
          this.dbService.updateAccountPro(this.proMode);
          if (!this.adsShowing && !this.proMode && !this.dbService.bypassPro) {
            //showads
            //this.setupAds(true);
          } else if (this.proMode) {
            //hideads
           // this.setupAds(false);
          }
        }
      })
      console.log(loggedIn);
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
    this.storage.modalShown = true;
    let modal = await this.modalCtrl.create({
      component: UpgradeComponent
    });
    modal.onDidDismiss().then(() => {
      this.storage.modalShown = false;
    })
    return await modal.present();
  }

  async editStylists() {
    this.storage.modalShown = true;
    let modal = await this.modalCtrl.create({
      component: AddStylistComponent
    });
    modal.onDidDismiss().then(() => {
      this.storage.modalShown = false;
    })
    return await modal.present();
  }

  async editServices() {
    this.router.navigate(['/tabs/tab1/services']);
  }

  async openSettings() {
    this.router.navigate(['/tabs/tab1/settings']);
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
