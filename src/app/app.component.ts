import { Component } from '@angular/core';

import { ModalController, NavController, Platform, isPlatform } from '@ionic/angular';
import { StatusBar } from '@awesome-cordova-plugins/status-bar/ngx';
import { StorageService } from './services/storage.service';
import { OneSignal } from '@awesome-cordova-plugins/onesignal/ngx';
import { LaunchReview } from '@awesome-cordova-plugins/launch-review/ngx';
import * as introjs from 'intro.js';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private statusBar: StatusBar,
    private storage: StorageService,
    private oneSignal: OneSignal,
    private launchReview: LaunchReview,
    private modalCtrl: ModalController,
    private navCtrl: NavController
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(async () => {
     
      this.statusBar.styleDefault();
      
      this.oneSignal.promptForPushNotificationsWithUserResponse();
      
      this.oneSignal.startInit('2f131849-a4b9-475f-908c-cc7f8770c435', '607609406851');

      this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.Notification);

      this.oneSignal.handleInAppMessageClicked().subscribe((data) => {
        if (data.click_name == 'review') {
          this.launchReview.launch();
        }
        if (data.click_name == 'upgradeMonthly') {
          let product = isPlatform('ios') ? 'com.clipped.monthly' : 'com.clipped.promode'
          this.storage.upgradeToPro(product);
        }
        if (data.click_name == 'upgradeAnnual') {
          let product = isPlatform('ios') ? 'com.clipped.annually' : 'com.clipped.upgradeannual'
          this.storage.upgradeToPro(product);
        }
      })

      this.oneSignal.handleNotificationReceived().subscribe(() => {
      // do something when notification is received
      });

      this.oneSignal.handleNotificationOpened().subscribe(async (data) => {
        // do something when a notification is opened
          if (data.notification.payload.additionalData.review) {
            this.launchReview.launch();
          }
      });

      this.oneSignal.endInit();
    });    

  }
}
