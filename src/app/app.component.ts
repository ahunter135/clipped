import { Component } from '@angular/core';

import { ModalController, NavController, Platform } from '@ionic/angular';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { StorageService } from './services/storage.service';
import { OneSignal } from '@ionic-native/onesignal/ngx';
import { LaunchReview } from '@ionic-native/launch-review/ngx';
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

      this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.InAppAlert);

      this.oneSignal.handleInAppMessageClicked().subscribe((data) => {
        if (data.click_name == 'review') {
          this.launchReview.launch();
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

    this.platform.backButton.subscribeWithPriority(998, () => {
      this.navCtrl.pop();
      return;
    });

    this.platform.backButton.subscribeWithPriority(999, (processNextHandler) => {
      if (this.storage.modalShown) {
        this.modalCtrl.dismiss();
        this.storage.modalShown = false;
      } else {
        processNextHandler();
      }
      return;
    });

  }
}
