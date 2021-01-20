import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { DbService } from 'src/app/services/db.service';

@Component({
  selector: 'app-edit-account',
  templateUrl: './edit-account.component.html',
  styleUrls: ['./edit-account.component.scss'],
})
export class EditAccountComponent implements OnInit {

  account = <any>{};
  constructor(private dbService: DbService, public modalCtrl: ModalController) { }

  async ngOnInit() {
    let type = this.dbService.accountType ? this.dbService.accountType : <any>await this.dbService.getAccountType();
    if (type) this.account = type;
    else {
      this.account = {
        type: 0
      }
    }
  }

  async save() {
    this.dbService.saveAccountType(this.account, false);
    await this.modalCtrl.dismiss();
  }



}
