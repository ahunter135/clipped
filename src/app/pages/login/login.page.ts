import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from 'src/app/services/storage.service';
import firebase from 'firebase';
import { GooglePlus } from '@ionic-native/google-plus/ngx';
import { DbService } from 'src/app/services/db.service';
import { Platform } from '@ionic/angular';
import { SignInWithApple, AppleSignInResponse, AppleSignInErrorResponse, ASAuthorizationAppleIDRequest } from '@ionic-native/sign-in-with-apple/ngx';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  email;
  password;
  loading = false;
  constructor(private router: Router, private storage: StorageService,private googlePlus: GooglePlus, private dbService: DbService, public platform: Platform, private signInWithApple: SignInWithApple) { }

  ngOnInit() {
  }

  async loginWithGoogle() {
    this.googlePlus.login({
      'webClientId': '607609406851-5qhr9cq463g5299dkl3jaj5e43o2se2v.apps.googleusercontent.com' 
    })
      .then(res => this.loginUsingGoogle(res))
      .catch(err => alert(JSON.stringify(err)));
  }

  async loginWithApple() {
    this.signInWithApple.signin({
      requestedScopes: [
        ASAuthorizationAppleIDRequest.ASAuthorizationScopeEmail
      ]
    })
    .then((res: AppleSignInResponse) => {
      this.loginUsingApple(res);
    })
    .catch((error: AppleSignInErrorResponse) => {
      alert(error.code + ' ' + error.localizedDescription);
      console.error(error);
    });
  }

  async loginUsingApple(res) {
    const provider = new firebase.auth.OAuthProvider('apple.com');
 
    // Create sign in credentials with our token
    const credential = provider.credential({
      idToken: res.identityToken
    });
    
    // Call the sign in with our created credentials
    firebase.auth().signInWithCredential(credential).then(async response => {
      this.dbService.uid = response.user.uid;
        await this.dbService.setupDb();
        await this.dbService.saveAccountType(0, true);
        this.handleResponse(response);
    }).catch(error => {
      this.loading = false;
    });
  }
  async loginUsingGoogle(res) {
    try {
      const { idToken, accessToken } = res;

      const credential = idToken ? firebase.auth.GoogleAuthProvider
        .credential(idToken, accessToken) : firebase.auth.GoogleAuthProvider
            .credential(accessToken);

      firebase.auth().signInWithCredential(credential).then(async response => {
        this.dbService.uid = response.user.uid;
        await this.dbService.setupDb();
        await this.dbService.saveAccountType(0, true);
        this.handleResponse(response);
      })    
    .catch(error => {
      this.loading = false;
    });
    } catch (error) {
      alert("Please make sure both fields are correct");
      this.loading = false;
    }
  }

  async login() {
    if (this.loading) return;
    else this.loading = true;
    try {
      firebase.auth().signInWithEmailAndPassword(this.email, this.password)
    .then(async response => {
      this.handleResponse(response);
    })
    .catch(error => {
      this.loading = false;
    });
    } catch (error) {
      alert("Please make sure both fields are correct");
      this.loading = false;
    }
  }

  async handleResponse(response) {
    let loginResponse = { key: "loggedIn", value: JSON.stringify(response.user) };
    await this.storage.setItem(loginResponse);
    this.loading = false;
    this.router.navigate(['/tabs/tab1'], {
      replaceUrl: true
    });
  }
}
