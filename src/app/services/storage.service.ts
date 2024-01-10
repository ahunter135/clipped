import { Injectable } from '@angular/core';
// import { Plugins } from '@capacitor/core';
// import { InAppPurchase } from '@ionic-native/in-app-purchase/ngx';
import { isPlatform, ModalController, Platform } from '@ionic/angular';
import { GlobalService } from './global.service';
import { Preferences } from '@capacitor/preferences';
import "cordova-plugin-purchase";

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  private data = null;
  cameFrom = "";
  security = "";
  clients = [];
  appointments = [];
  productIds = [];
  products: any;
  proMode = false;
  services = [];
  modalShown = false;
  store: CdvPurchase.Store;
  product: CdvPurchase.Product;
  productType: CdvPurchase.ProductType;

  constructor(public globalService: GlobalService, private modalCtrl: ModalController, private platform: Platform) {
    //Preferences.clear();
  }

  async setItem(obj) {
    await Preferences.set(obj);
  }

  async getItem(key) {
    const ret = await Preferences.get({ key: key });
    const obj = JSON.parse(ret.value);

    return obj
  }

  async removeItem(key) {
    await Preferences.remove({ key: key });
  }

  async getKeys() {
    const { keys } = await Preferences.keys();

    return keys
  }

  async clearStorage() {
    await Preferences.clear();
  }

  async setData(data) {
    this.data = data;
  }

  async getData() {
    return this.data;
  }

  async upgradeToPro(product) {
    
  }

  // async upgradeToPro(product) {
  //   this.iap.subscribe(product).then((data) => {
  //     this.setItem({key: 'pro', value: true});
  //     this.globalService.publishData({key: 'pro', value: true});
  //     this.proMode = true;
  //     this.modalCtrl.dismiss();
  //     return data;
  //   }).catch((err) => {
  //     console.log(err);
  //   });
  // }

  async setupAIP() {
    this.store = CdvPurchase.store;
    await this.store.initialize();

    // NOT SURE IF OR WHERE THIS GOES
    // this.store.ready(() => {
    //   this.doStuff();
    // });

    this.store.register([
      {
        id: "com.clipped.promode",
        platform: CdvPurchase.Platform.GOOGLE_PLAY,
        type: CdvPurchase.ProductType.PAID_SUBSCRIPTION
      },
      {
        id: "com.clipped.upgradesemi",
        platform: CdvPurchase.Platform.GOOGLE_PLAY,
        type: CdvPurchase.ProductType.PAID_SUBSCRIPTION
      },
      {
        id: "com.clipped.upgradeannual",
        platform: CdvPurchase.Platform.GOOGLE_PLAY,
        type: CdvPurchase.ProductType.PAID_SUBSCRIPTION
      },
      {
        id: "com.clipped.annually",
        platform: CdvPurchase.Platform.APPLE_APPSTORE,
        type: CdvPurchase.ProductType.PAID_SUBSCRIPTION
      },
      {
        id: "com.clipped.monthly",
        platform: CdvPurchase.Platform.APPLE_APPSTORE,
        type: CdvPurchase.ProductType.PAID_SUBSCRIPTION
      },
      {
        id: "com.clipped.semiannual",
        platform: CdvPurchase.Platform.APPLE_APPSTORE,
        type: CdvPurchase.ProductType.PAID_SUBSCRIPTION
      }
    ]);

    const purchases = this.store.verifiedPurchases;

    if (purchases.length > 0) {
      const latestPurchase = purchases[0];
      if (!latestPurchase.isExpired) {
        this.setItem({key: 'pro', value: true});
        this.globalService.publishData({key: 'pro', value: true});
        this.proMode = true;
      } else {
        this.setItem({key: 'pro', value: false});
        this.globalService.publishData({key: 'pro', value: false});
        this.proMode = false;
      }
    }
  }

  // async setupIAP() {
  //   let productId = "com.clipped.promode";
  //   let products = [];
  //   if (isPlatform('android')) {
  //     products = [productId, 'com.clipped.upgradesemi', 'com.clipped.upgradeannual'];
  //   } else if (isPlatform('ios')) {
  //     products = ["com.clipped.annually", "com.clipped.monthly", "com.clipped.semiannual"];
  //   }
  //   this.iap.getProducts(products).then(async (products) => {
  //     this.products = products;
  //       // TODO check if receipt is good enough
  //       this.iap.restorePurchases().then((receipt) => {
  //         console.log(receipt);
  //         if (this.platform.is('ios')) {
  //           if (receipt.length > 0) {
  //             if (receipt[0].state != 3) {
  //               this.setItem({key: "pro", value: false})
  //               this.globalService.publishData({key: 'pro', value: false});
  //               this.proMode = false;
  //             } else {
  //               this.setItem({key: 'pro', value: true});
  //               this.proMode = true;
  //               this.globalService.publishData({key: 'pro', value: true});
  //             }
  //           } else {
  //             this.setItem({key: "pro", value: false})
  //             this.globalService.publishData({key: 'pro', value: false});
  //           }
  //         } else {
  //           if (receipt.length > 0) {
  //             let purchaseState = JSON.parse(receipt[0].receipt).purchaseState;
  //             if (purchaseState != 0) {
  //               this.setItem({key: "pro", value: false})
  //               this.globalService.publishData({key: 'pro', value: false});
  //               this.proMode = false;
  //             } else {
  //               this.setItem({key: 'pro', value: true});
  //               this.proMode = true;
  //               this.globalService.publishData({key: 'pro', value: true});
  //             }
  //           } else {
  //             this.setItem({key: "pro", value: false})
  //             this.globalService.publishData({key: 'pro', value: false});
  //           }
  //         }
          
  //       }).catch((err) => {
  //         console.log(err);
  //       });
  //   }).catch((err) => {
  //     console.log(err);
  //   });
  // }

  
}
