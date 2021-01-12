import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import firebase from 'firebase';
import * as moment from 'moment';
import { v4 as uuidv4 } from 'uuid';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class DbService {
  uid;
  email;
  db;
  constructor(private storage: StorageService, private router: Router) {}

  async setupDb() {
    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);
    this.db = firebase.firestore();
  }

  async getClients() {
    this.storage.clients = [];
    return new Promise( (resolve, reject) => {
      let clientRef = this.db.collection('users').doc(this.uid).collection('clients');
      clientRef.orderBy("name").get().then((clients) =>{
        clients.forEach(function(doc) {
          let obj = doc.data();
          obj.id = doc.id;
          this.storage.clients.push(obj);
        }.bind(this));
        resolve(this.storage.clients);
      }).catch((err) => {
        this.handleError(err)
      });      
    });
    
  }

  async addClient(client) {
    let image = await this.getAvatar(client);
    client.uuid = uuidv4();
    //let ref = this.uploadImage(image, client.uuid);
    let clientRef = this.db.collection('users').doc(this.uid).collection('clients');
    return await clientRef.doc(uuidv4()).set({
      name: client.name,
      visits: [
        {
          date: moment(client.last_visit).format("MMM Do YYYY"),
          summary: client.summary,
          uuid: uuidv4()
        }
      ],
      image: image,
      uuid: client.uuid,
      pro: false
    }).catch((err) => {
      this.handleError(err)
    });   ;
  }

  async editClient(client) {
    let clientRef = this.db.collection('users').doc(this.uid).collection('clients');
    return await clientRef.doc(client.id).update({
      name: client.name,
      visits: client.visits,
      image: client.image,
      uuid: client.uuid,
      pro: false
    }).catch((err) => {
      this.handleError(err)
    });   ;
  }

  async deleteClient(client) {
    let storageRef = firebase.storage().ref();
    storageRef.child(this.uid).child(client.uuid).listAll().then(dir => {
      dir.items.forEach(fileRef => {
        storageRef.child(this.uid).child(client.uuid).child(fileRef.name).delete();
      });
    }).catch((err) => {
      this.handleError(err)
    });   ;

    firebase.firestore().collection('users').doc(this.uid).collection('clients').get().then(function(docs) {
      docs.forEach(element => {
        if (element.data().uuid === client.uuid) {
          this.db.collection('users').doc(this.uid).collection('clients').doc(element.id).delete().then(function() {
            return true;
          }).catch(function(err) {
            return false;
          });
        }
      });
    }.bind(this)).catch((err) => {
      this.handleError(err)
    });   
    
  }
  private deleteFile(pathToFile, fileName) {
    const ref = firebase.storage().ref(pathToFile);
    const childRef = ref.child(fileName);
    childRef.delete().catch((err) => {
      this.handleError(err)
    });   
  }

  async getAvatar(client) {
    return new Promise( (resolve, reject) => {
      let image = new Image();
      image.crossOrigin = 'Anonymous';
      image.onload = function() {
        let canvas = <HTMLCanvasElement> document.createElement('CANVAS'),
        ctx = canvas.getContext('2d'),
        dataURL;
        canvas.height = 64;
        canvas.width = 64;
        ctx.drawImage(image, 0, 0);
        dataURL = canvas.toDataURL("image/jpeg");
        canvas = null;
        resolve(dataURL);
      }
      image.src = "https://ui-avatars.com/api/?background=f3f3f3&name="+client.name;
    });
  }

  async getClientImages(client) {
    return new Promise( async (resolve, reject) => {
      let storageRef = firebase.storage().ref();
      let imagesRef = await storageRef.child(this.uid).child(client.uuid).listAll();
      let imageUrls = [];
      for (let i = 0; i < imagesRef.items.length; i++) {
        imageUrls.push(await imagesRef.items[i].getDownloadURL())
      }
      resolve(imageUrls);
    })
  }

  async uploadImage(imageUri, uuid) {
    return new Promise((resolve, reject) => {
      let storageRef = firebase.storage().ref();
      let imageRef = storageRef.child(this.uid).child(uuid).child(moment().format());
      let uploadTask = imageRef.putString(imageUri, "data_url");

      uploadTask.on(
        "state_changed",
        (_snapshot: any) => {
          
        },
        _error => {
          reject(_error);
        },
        () => {
          // completion...
          resolve(uploadTask.snapshot);
        }
      );
    });
  }

  async editClientVisit(client) {
    this.editClient(client);
  }

  async handleError(err) {
    this.storage.clearStorage();
    this.router.navigate(['/login'], {
      replaceUrl: true
    });
  }
 
}
