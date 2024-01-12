import { Injectable } from '@angular/core';
// import { Plugins } from '@capacitor/core';
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
    this.platform.ready().then(() => {
      this.store = CdvPurchase.store;
      this.registerProducts();
      this.setupListener();
      // Get the real product information
      this.store.initialize();
      this.store.ready(() => {
        if (this.store) {
          this.products = this.store.products;
          console.log(this.products);
        }
      });
    });
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

  async upgradeToPro(product :CdvPurchase.Product) {
    this.store.order(product.getOffer()).then((p) => {
      this.modalCtrl.dismiss();
    }).catch((err) => {
      console.log(err);
      this.modalCtrl.dismiss();
    });
    
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

  setupListener() {
    if (this.store) {
      this.store
        .when()
        .approved(async (p: any) => {
          // This has all the products that have been purchased.
          // Verify they match up with what we have in the DB.
          if (p.state == 'approved') {
            this.setItem({key: 'pro', value: true});
            this.globalService.publishData({key: 'pro', value: true});
            this.proMode = true;
          } else {
            this.setItem({key: 'pro', value: false});
            this.globalService.publishData({key: 'pro', value: false});
            this.proMode = false;
          }

          return p.verify();
        })
        .verified((p: any) => p.finish())
        .finished(() => {});
    }
  }

  registerProducts() {
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
  }

  
}
