import { Injectable } from '@angular/core';
import { Plugins } from '@capacitor/core';
import { InAppPurchase } from '@ionic-native/in-app-purchase/ngx';
import { isPlatform, ModalController, Platform } from '@ionic/angular';
import { GlobalService } from './global.service';

const { Storage } = Plugins;
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
  constructor(private iap: InAppPurchase, public globalService: GlobalService, private modalCtrl: ModalController, private platform: Platform) {
    //Storage.clear();
  }

  async setItem(obj) {
    await Storage.set(obj);
  }

  async getItem(key) {
    const ret = await Storage.get({ key: key });
    const obj = JSON.parse(ret.value);

    return obj
  }

  async removeItem(key) {
    await Storage.remove({ key: key });
  }

  async getKeys() {
    const { keys } = await Storage.keys();

    return keys
  }

  async clearStorage() {
    await Storage.clear();
  }

  async setData(data) {
    this.data = data;
  }

  async getData() {
    return this.data;
  }

  async upgradeToPro(product) {
    this.iap.subscribe(product).then((data) => {
      this.setItem({key: 'pro', value: true});
      this.globalService.publishData({key: 'pro', value: true});
      this.proMode = true;
      this.modalCtrl.dismiss();
      return data;
    }).catch((err) => {
      console.log(err);
    });
  }

  async setupIAP() {
    let productId = "com.clipped.promode";
    let products = [];
    if (isPlatform('android')) {
      products = [productId, 'com.clipped.upgradesemi', 'com.clipped.upgradeannual'];
    } else if (isPlatform('ios')) {
      products = ["com.clipped.annually", "com.clipped.monthly", "com.clipped.semiannual"];
    }
    this.iap.getProducts(products).then(async (products) => {
      this.products = products;
        // TODO check if receipt is good enough
        this.iap.restorePurchases().then((receipt) => {
          console.log(receipt);
          if (this.platform.is('ios')) {
            if (receipt.length > 0) {
              if (receipt[0].state != 3) {
                this.setItem({key: "pro", value: false})
                this.globalService.publishData({key: 'pro', value: false});
                this.proMode = false;
              } else {
                this.setItem({key: 'pro', value: true});
                this.proMode = true;
                this.globalService.publishData({key: 'pro', value: true});
              }
            } else {
              this.setItem({key: "pro", value: false})
              this.globalService.publishData({key: 'pro', value: false});
            }
          } else {
            if (receipt.length > 0) {
              let purchaseState = JSON.parse(receipt[0].receipt).purchaseState;
              if (purchaseState != 0) {
                this.setItem({key: "pro", value: false})
                this.globalService.publishData({key: 'pro', value: false});
                this.proMode = false;
              } else {
                this.setItem({key: 'pro', value: true});
                this.proMode = true;
                this.globalService.publishData({key: 'pro', value: true});
              }
            } else {
              this.setItem({key: "pro", value: false})
              this.globalService.publishData({key: 'pro', value: false});
            }
          }
          
        }).catch((err) => {
          console.log(err);
        });
    }).catch((err) => {
      console.log(err);
    });
  }

  
}
