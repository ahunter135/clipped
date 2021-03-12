import { Component, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';
import firebase from 'firebase';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.page.html',
  styleUrls: ['./reset-password.page.scss'],
})
export class ResetPasswordPage implements OnInit {
  email;
  constructor(private toastCtrl: ToastController) { }

  ngOnInit() {
  }

  reset() {
    firebase.auth().sendPasswordResetEmail(this.email).then(async () => {
      let toast = await this.toastCtrl.create({
        message: "Email has been sent",
        duration: 2000
      });

      return await toast.present();
    })
  }
}
