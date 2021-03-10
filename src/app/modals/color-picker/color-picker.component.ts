import { Component, OnInit } from '@angular/core';
import { ModalController, Platform } from '@ionic/angular';

@Component({
  selector: 'app-color-picker',
  templateUrl: './color-picker.component.html',
  styleUrls: ['./color-picker.component.scss'],
})
export class ColorPickerComponent implements OnInit {

  constructor(public modalCtrl: ModalController, private platform: Platform) { }

  ngOnInit() {
    this.platform.backButton.subscribeWithPriority(10, () => {
      this.modalCtrl.dismiss();
    });
  }
  ionViewWillLeave() {
    this.platform.backButton.unsubscribe();
  }

  chooseColor(color) {
    this.modalCtrl.dismiss({
      color: color
    })
  }
}
