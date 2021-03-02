import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Keyboard } from '@ionic-native/keyboard/ngx';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { InAppPurchase } from '@ionic-native/in-app-purchase/ngx';
import { Camera } from '@ionic-native/camera/ngx';
import { File } from '@ionic-native/file/ngx';
import { Crop } from '@ionic-native/crop/ngx';
import { Base64 } from '@ionic-native/base64/ngx';
import { UpgradeComponent } from './modals/upgrade/upgrade.component';
//import { Instagram } from '@ionic-native/instagram/ngx';
import { FileTransfer } from '@ionic-native/file-transfer/ngx';
import { SMS } from '@ionic-native/sms/ngx';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import firebase from 'firebase';
import { AdMob } from '@admob-plus/ionic/ngx';
import { OneSignal } from '@ionic-native/onesignal/ngx';
import { LaunchReview } from '@ionic-native/launch-review/ngx';
import { AddStylistComponent } from './modals/add-stylist/add-stylist.component';
import { GooglePlus } from '@ionic-native/google-plus/ngx';
import { ClientByIDPipe } from './pipes/client-by-id.pipe';
import { GoogleMaps } from '@ionic-native/google-maps/ngx';
import { SignInWithApple } from '@ionic-native/sign-in-with-apple/ngx';
import { PetsComponent } from './modals/pets/pets.component';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { LaunchNavigator } from '@ionic-native/launch-navigator/ngx';

var firebaseConfig = {
  apiKey: "AIzaSyCZ7Mr6qSgFcA7A0p5JVfjby-lXlHGZbKc",
  authDomain: "clipped-3c152.firebaseapp.com",
  databaseURL: "https://clipped-3c152.firebaseio.com",
  projectId: "clipped-3c152",
  storageBucket: "clipped-3c152.appspot.com",
  messagingSenderId: "607609406851",
  appId: "1:607609406851:web:7a607f6fdc9d24bbd1a2b6",
  measurementId: "G-4DM3T7LSVX"
};
firebase.initializeApp(firebaseConfig);

@NgModule({
  declarations: [AppComponent, UpgradeComponent, AddStylistComponent, PetsComponent],
  entryComponents: [UpgradeComponent, AddStylistComponent, PetsComponent],
  imports: [BrowserModule, IonicModule.forRoot({
    mode: 'ios'
  }), AppRoutingModule, FormsModule],
  providers: [
    StatusBar,
    SplashScreen,
    InAppPurchase,
    Camera,
    File,
    Crop,
    Base64,
    //Instagram,
    FileTransfer,
    LaunchReview,
    SMS,
    InAppBrowser,
    AdMob,
    OneSignal,
    Keyboard,
    GooglePlus,
    GoogleMaps,
    AndroidPermissions,
    ClientByIDPipe,
    DatePipe,
    LaunchNavigator,
    SignInWithApple,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
