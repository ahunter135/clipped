import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Pet } from 'src/app/classes/pet';

@Component({
  selector: 'app-pets',
  templateUrl: './pets.component.html',
  styleUrls: ['./pets.component.scss'],
})
export class PetsComponent implements OnInit {

  pets = [];
  constructor(public modalCtrl: ModalController) { }

  ngOnInit() {}

  async addPet() {
    let pet = new Pet();
    this.pets.push(pet);
  }

  async submit() {
    this.modalCtrl.dismiss(this.pets);
  }

}
