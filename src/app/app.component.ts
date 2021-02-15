import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { StorageService } from './services/storage.service';
import { OneSignal } from '@ionic-native/onesignal/ngx';

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
    private oneSignal: OneSignal
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(async () => {
     
      this.statusBar.styleDefault();
      this.splashScreen.hide();

      this.oneSignal.startInit('b2f7f966-d8cc-11e4-bed1-df8f05be55ba', '607609406851');

      this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.InAppAlert);

      this.oneSignal.handleNotificationReceived().subscribe(() => {
      // do something when notification is received
      });

      this.oneSignal.handleNotificationOpened().subscribe(() => {
        // do something when a notification is opened
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
