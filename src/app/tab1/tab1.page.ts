import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { DbService } from '../services/db.service';
import { StorageService } from '../services/storage.service';
import firebase from 'firebase';
import { GlobalService } from '../services/global.service';
import { ModalController } from '@ionic/angular';
import { UpgradeComponent } from '../modals/upgrade/upgrade.component';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

  numClients = 0;
  proMode = false;
  constructor(public storage: StorageService, private router: Router, private dbService: DbService, public globalService: GlobalService,
    public modalCtrl: ModalController) {}

  ngOnInit() {}

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
        console.log("TAB 1 SUBSCRIBE");
        if (data.key === 'pro') {
          this.proMode = data.value;
        }
      })
      this.dbService.uid = loggedIn.uid;
      this.dbService.email = loggedIn.email;
      await this.storage.setupIAP();
      await this.dbService.setupDb();
      await this.dbService.getClients();
      this.numClients = this.storage.clients.length;
    }
  }

  async upgrade() {
    let modal = await this.modalCtrl.create({
      component: UpgradeComponent
    });
    return await modal.present();
  }

  
}
