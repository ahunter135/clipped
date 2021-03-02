import { Component, OnInit } from '@angular/core';
import { AlertController, ModalController, NavParams } from '@ionic/angular';
import { Pet } from 'src/app/classes/pet';

@Component({
  selector: 'app-pets',
  templateUrl: './pets.component.html',
  styleUrls: ['./pets.component.scss'],
})
export class PetsComponent implements OnInit {

  pets = [];
  constructor(public modalCtrl: ModalController, private navParams: NavParams, private alertCtrl: AlertController) { }

  ngOnInit() {
    this.pets = this.navParams.data.pets;
  }

  async addPet() {
    let pet = new Pet();
    this.pets.push(pet);
  }

  async submit() {
    this.modalCtrl.dismiss(this.pets);
  }

  async remove(i) {
    console.log(i);
    let res = await this.presentAlertConfirm("Are you sure you want to remove this pet?");
    if (res) {
      this.pets.splice(i, 1);
    }
  }

  async presentAlertConfirm(message) {
    return new Promise(async (resolve, reject) => {
      const alert = await this.alertCtrl.create({
        header: 'Confirm!',
        message: message,
        buttons: [
          {
            text: 'No',
            role: 'cancel',
            cssClass: 'secondary',
            handler: (blah) => {
              resolve(false);
            }
          }, {
            text: 'Yes',
            handler: () => {
              resolve(true);
            }
          }
        ]
      });
  
      await alert.present();
    });  
    
  }

}
