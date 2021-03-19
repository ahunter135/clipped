import { Component, OnInit } from '@angular/core';
import { AlertController, ModalController, NavParams } from '@ionic/angular';
import { Pet } from 'src/app/classes/pet';
import { CameraService } from 'src/app/services/camera.service';
import { DbService } from 'src/app/services/db.service';
import { GlobalService } from 'src/app/services/global.service';

@Component({
  selector: 'app-pets',
  templateUrl: './pets.component.html',
  styleUrls: ['./pets.component.scss'],
})
export class PetsComponent implements OnInit {
  client;
  petsList = [];
  loading = false;
  selectedPetIndex;
  constructor(public modalCtrl: ModalController, private navParams: NavParams, private alertCtrl: AlertController, private cameraService: CameraService, private globalService: GlobalService, private dbService: DbService) { }

  ngOnInit() {
    this.client = Object.assign({}, this.navParams.data.client);
    this.petsList = Object.assign([], this.navParams.data.pets);
    for (let i = 0; i < this.petsList.length; i++) {
      if (this.petsList[i].isActive == undefined) {
        this.petsList[i].isActive = true;
      }
    }

    this.globalService.getObservable().subscribe(async (data) => {
      if (data.key === 'pet-images') {
        if (!data.value) {
          this.loading = false;
          return;
        }
        let images = <any>await this.dbService.getClientProfileImages(this.client);
        this.petsList[this.selectedPetIndex].image = images[images.length - 1];
        this.loading = false;
      }
    });
  }

  async addPet() {
    let pet = new Pet();
    this.petsList.push(pet);
  }

  async dismiss() {
    this.modalCtrl.dismiss();
  }

  async save() {
    this.modalCtrl.dismiss(this.petsList);
  }

  async remove(i) {
    let res = await this.presentAlertConfirm("Are you sure you want to remove this pet?");
    if (res) {
      this.petsList.splice(i, 1);
    }
  }

  async editProfileImg(index) {
    if (this.loading) return;
    else this.loading = true;
    this.selectedPetIndex = index;
    this.cameraService.startCameraProcess(this.client, 'pets'); 
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
