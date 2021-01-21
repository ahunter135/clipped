import { Component, OnInit } from '@angular/core';
import { ModalController, NavController } from '@ionic/angular';
import { DbService } from 'src/app/services/db.service';

@Component({
  selector: 'app-edit-account',
  templateUrl: './edit-account.component.html',
  styleUrls: ['./edit-account.component.scss'],
})
export class EditAccountComponent implements OnInit {

  account = <any>{};
  state = "home";
  constructor(private dbService: DbService, public modalCtrl: ModalController, private navCtrl: NavController) { }

  async ngOnInit() {
    let type = this.dbService.accountType ? this.dbService.accountType : <any>await this.dbService.getAccountType();
    if (type) this.account = type;
    else {
      this.account = {
        type: 0
      }
    }
  }

  async editTextTemplates() {
    this.state = "edit-templates";
  }

  async save() {
    this.dbService.saveAccountType(this.account, false);
    await this.modalCtrl.dismiss();
  }



}
