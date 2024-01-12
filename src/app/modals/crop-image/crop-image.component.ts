import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';

@Component({
  selector: 'app-crop-image',
  templateUrl: './crop-image.component.html',
  styleUrls: ['./crop-image.component.scss'],
})
export class CropImageComponent implements OnInit {
  @ViewChild('image') input: ElementRef;
  imageBase64: any;
  width: number;
  height: number;
  cropperOptions: any;
  croppedImage;
  constructor(public navParams: NavParams, public modalCtrl: ModalController) {
    this.imageBase64 = this.navParams.get("imageBase64");
    this.width = this.navParams.get("width");
    this.height = this.navParams.get("height");
  }

  ngOnInit() {
  }

  cropperLoad() {
  }

  cropperReset() {  }

  imageRotate() {  }

  cancel() { this.modalCtrl.dismiss(); }

  // imageCropped(event: ImageCroppedEvent) {
  //   this.croppedImage = event.base64;
  // }

  finish() {
    this.modalCtrl.dismiss(this.croppedImage);
  }

}
