import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-color-picker',
  templateUrl: './color-picker.component.html',
  styleUrls: ['./color-picker.component.scss'],
})
export class ColorPickerComponent implements OnInit {

  constructor(public modalCtrl: ModalController) { }

  ngOnInit() {}

  chooseColor(color) {
    this.modalCtrl.dismiss({
      color: color
    })
  }
}
