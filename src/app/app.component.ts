import { Component } from '@angular/core';

import { ModalController, NavController, Platform, isPlatform } from '@ionic/angular';
import { StatusBar } from '@awesome-cordova-plugins/status-bar/ngx';
import { StorageService } from './services/storage.service';
import OneSignal from 'onesignal-cordova-plugin';
import {  } from 'onesignal-cordova-plugin';
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
    private launchReview: LaunchReview,
    private modalCtrl: ModalController,
    private navCtrl: NavController
  ) {
    this.initializeApp();
  }

  OneSignalInit(): void {
    // Uncomment to set OneSignal device logging to VERBOSE  
    // OneSignal.Debug.setLogLevel(6);
    
    // Uncomment to set OneSignal visual logging to VERBOSE  
    // OneSignal.Debug.setAlertLevel(6);
  
    // NOTE: Update the init value below with your OneSignal AppId.
    OneSignal.initialize("2f131849-a4b9-475f-908c-cc7f8770c435");
    
    let myClickListener = async (event) => {
      let notificationData = JSON.stringify(event);
      if (notificationData == 'review') {
        this.launchReview.launch();
      }
  };
    OneSignal.Notifications.addEventListener("click", myClickListener);
    
    // Prompts the user for notification permissions.
    //    * Since this shows a generic native prompt, we recommend instead using an In-App Message to prompt for notification permission (See step 7) to better communicate to your users what notifications they will get.
    OneSignal.Notifications.requestPermission(true).then((accepted: boolean) => {
      console.log("User accepted notifications: " + accepted);
    });
  
    let inAppClickListener = async (event) => {
      let clickData = event.result.actionId;
      console.log("In-App Message Clicked: "+ clickData);
      console.log(clickData);
      if (clickData == 'review') {
        this.launchReview.launch();
      }
      if (clickData == 'upgradeMonthly') {
        let productId = isPlatform('ios') ? 'com.clipped.monthly' : 'com.clipped.promode'
        console.log(productId);
        this.storage.upgradeToPro(productId);
      }
      if (clickData == 'upgradeAnnual') {
        let productId = isPlatform('ios') ? 'com.clipped.annually' : 'com.clipped.upgradeannual'
        this.storage.upgradeToPro(productId);
      }
    };
    OneSignal.InAppMessages.addEventListener("click", inAppClickListener);
  
  }

  initializeApp() {
    this.platform.ready().then(async () => {
     
      // not sure what this does exactly. Could replace with capacitors status bar maybe
      this.statusBar.styleDefault();
      this.OneSignalInit();
      // this.oneSignal.promptForPushNotificationsWithUserResponse();
      
      // this.oneSignal.startInit('2f131849-a4b9-475f-908c-cc7f8770c435', '607609406851');
      // this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.Notification);

      // this.oneSignal.handleInAppMessageClicked().subscribe((data) => {
      //   if (data.click_name == 'review') {
      //     this.launchReview.launch();
      //   }
        // if (data.click_name == 'upgradeMonthly') {
        //   let product = isPlatform('ios') ? 'com.clipped.monthly' : 'com.clipped.promode'
        //   this.storage.upgradeToPro(product);
        // }
        // if (data.click_name == 'upgradeAnnual') {
        //   let product = isPlatform('ios') ? 'com.clipped.annually' : 'com.clipped.upgradeannual'
        //   this.storage.upgradeToPro(product);
        // }
      // })

      // this.oneSignal.handleNotificationReceived().subscribe(() => {
      // // do something when notification is received
      // });

      // this.oneSignal.handleNotificationOpened().subscribe(async (data) => {
      //   // do something when a notification is opened
      //     if (data.notification.payload.additionalData.review) {
      //       this.launchReview.launch();
      //     }
      // });

      // this.oneSignal.endInit();
    });    

  }
}
