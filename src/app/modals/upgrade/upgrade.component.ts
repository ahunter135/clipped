import { Component, OnInit } from '@angular/core';
import { ModalController, isPlatform } from '@ionic/angular';
import { DbService } from 'src/app/services/db.service';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-upgrade',
  templateUrl: './upgrade.component.html',
  styleUrls: ['./upgrade.component.scss'],
})
export class UpgradeComponent implements OnInit {

  constructor(public modalCtrl: ModalController, private storage: StorageService, public dbService: DbService) { }

  ngOnInit() {}
  
  async upgrade(product) {
    this.storage.upgradeToPro(product);
  }

  getPlatform() {
    return isPlatform('ios');
  }
}
