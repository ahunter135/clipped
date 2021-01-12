import { Component } from '@angular/core';
import { GlobalService } from '../services/global.service';
import { StorageService } from '../services/storage.service';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {

  count = 0;
  constructor(private globalService: GlobalService, private storage: StorageService) {}

  easterEgg() {
    this.count++;
    if (this.count >= 10) {
      this.storage.setItem({key: 'pro', value: true});
      this.storage.proMode = true;
      this.globalService.publishData({key: 'pro', value: true});
    }
  }

  reset() {
    this.count = 0;
  }
}
