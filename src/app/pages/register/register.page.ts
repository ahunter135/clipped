import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import firebase from 'firebase';
import { DbService } from 'src/app/services/db.service';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {
  email;
  password;
  loading = false;
  constructor(private storage: StorageService, private router: Router, private dbService: DbService) { }

  ngOnInit() {
  }

  login() {
    if (this.loading) return;
    else this.loading = true;
    firebase.auth().createUserWithEmailAndPassword(this.email, this.password)
    .then(async response => {
      let loginResponse = { key: "loggedIn", value: JSON.stringify(response.user) };
      await this.storage.setItem(loginResponse);
      this.loading = false;
      this.dbService.uid = response.user.uid;
      await this.dbService.setupDb();
      await this.dbService.saveAccountType(0, true, false);
      this.router.navigate(['/tabs/tab1'], {
        replaceUrl: true
      });
    })
    .catch(error => {
      this.loading = false;
      alert(error);
    });
  }

}
