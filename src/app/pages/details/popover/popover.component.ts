import { Component, OnInit } from '@angular/core';
import { NavParams } from '@ionic/angular';
import { DbService } from 'src/app/services/db.service';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-popover',
  templateUrl: './popover.component.html',
  styleUrls: ['./popover.component.scss'],
})
export class PopoverComponent implements OnInit {

  client;
  dismissPopover;
  text;
  visit;
  constructor(private dbService: DbService, private storage: StorageService, public navParams: NavParams) {
    this.client = this.navParams.data.client;
    this.dismissPopover = this.navParams.data.popover;
    this.text = this.navParams.data.text;
    this.visit = this.navParams.data.visit ? this.navParams.data.visit : null;
  }

  ngOnInit() {
    
  }

  delete() {
    if (this.text === "Delete Client") {
      for (let i = 0; i < this.storage.clients.length; i++) {
        if (this.storage.clients[i].uuid == this.client.uuid) {
          this.storage.clients.splice(i, 1);
        }
      }
      this.dbService.deleteClient(this.client);
    } else if (this.text === "Delete Visit") {
      for (let i = 0; i < this.client.visits.length; i++) {
        if (this.client.visits[i].uuid == this.visit.uuid) {
          this.client.visits.splice(i, 1);
          break;
        }
      }
      this.dbService.editClientVisit(this.client);
    }
    
    this.dismissPopover.dismiss({delete: true});
  }

}
