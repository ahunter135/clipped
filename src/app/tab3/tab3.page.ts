import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { UpgradeComponent } from '../modals/upgrade/upgrade.component';
import { DbService } from '../services/db.service';
import { StorageService } from '../services/storage.service';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {
  darkMode;
  constructor(public storage: StorageService, private router: Router, public dbService: DbService, private modalCtrl: ModalController) {
  }

  async ionViewDidEnter() {
    this.darkMode = await this.storage.getItem("darkMode") ? await this.storage.getItem("darkMode") : false;
  }

  logout() {
    this.storage.clearStorage();
    this.router.navigate(['/login'], {
      replaceUrl: true
    });
  }

  editUserAccount() {
    
  }

  async upgrade() {
    let modal = await this.modalCtrl.create({
      component: UpgradeComponent
    });

    return await modal.present();
    //let proRecipt = await this.storage.upgradeToPro();
  }

  async toggleDarkMode() {
      this.storage.setItem({key: 'darkMode', value: this.darkMode});
      document.body.classList.toggle('dark', this.darkMode);
  }
}
