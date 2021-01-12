import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-upgrade',
  templateUrl: './upgrade.component.html',
  styleUrls: ['./upgrade.component.scss'],
})
export class UpgradeComponent implements OnInit {

  constructor(public modalCtrl: ModalController, private storage: StorageService) { }

  ngOnInit() {}

  async upgrade(product) {
    this.storage.upgradeToPro(product);
  }
}
