import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { StorageService } from './services/storage.service';
import { OneSignal } from '@ionic-native/onesignal/ngx';
import { LaunchReview } from '@ionic-native/launch-review/ngx';
import * as introjs from 'intro.js';
import { GlobalService } from './services/global.service';
import { Router } from '@angular/router';
import { LottieSplashScreen } from '@ionic-native/lottie-splash-screen/ngx';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private storage: StorageService,
    private oneSignal: OneSignal,
    private launchReview: LaunchReview,
    private globalService: GlobalService,
    private router: Router,
    private lottie: LottieSplashScreen
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
      //let token = await this.fcm.getToken();
      //console.log(token);
      if (await this.storage.getItem("darkMode")) {
        toggleDarkTheme(true);
      } else {
        toggleDarkTheme(false);
      }

      // Add or remove the "dark" class based on if the media query matches
      function toggleDarkTheme(shouldAdd) {
        document.body.classList.toggle('dark', shouldAdd);
      }

    });    
  }
}
