import { Component, OnInit } from '@angular/core';
import { AlertController, ModalController, Platform } from '@ionic/angular';
import { DbService } from 'src/app/services/db.service';

@Component({
  selector: 'app-add-stylist',
  templateUrl: './add-stylist.component.html',
  styleUrls: ['./add-stylist.component.scss'],
})
export class AddStylistComponent implements OnInit {
  stylists = [];
  constructor(private alertCtrl: AlertController, public modalCtrl: ModalController, private dbService: DbService, private platform: Platform) { }

  async ngOnInit() {
    this.stylists = <any>await this.dbService.getStylists();
    this.platform.backButton.subscribeWithPriority(10, () => {
      this.modalCtrl.dismiss();
    });
  }
  ionViewWillLeave() {
    this.platform.backButton.unsubscribe();
  }

  async add() {
    const alert = await this.alertCtrl.create({
      cssClass: 'my-custom-class',
      header: 'Add Stylist',
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: 'Stylist Name'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');
          }
        }, {
          text: 'Add',
          handler: async (data) => {
            let name = data.name;
            await this.dbService.addStylist(name);
            this.stylists = <any>await this.dbService.getStylists();
          }
        }
      ]
    });

    await alert.present();
  }

  async remove(index) {
    this.stylists.splice(index, 1);
    await this.dbService.saveStylists(this.stylists);
  }
}
