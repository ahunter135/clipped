import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import firebase from 'firebase';
import * as moment from 'moment';
import { v4 as uuidv4 } from 'uuid';
import { GlobalService } from './global.service';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class DbService {
  uid;
  email;
  db;
  loader;
  proLimit = 10;
  userLimit;
  accountType;
  bypassPro = false;
  constructor(private storage: StorageService, private router: Router, private globalService: GlobalService) {}

  async setupDb() {
    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);
    this.db = firebase.firestore();
    this.db.collection('rules').doc('proLimit').get().then((limit) => {
      this.proLimit = limit.data().limit;
    })
  }

  async getAccountType() {
    return new Promise((resolve, reject) => {
      this.db.collection('users').doc(this.uid).get().then(details => {
        try {
          this.accountType = details.data().type;
          this.userLimit = details.data().limit;
          this.bypassPro = details.data().bypasspro ? details.data().bypasspro : false;
          console.log(this.bypassPro);
          if (details.data()) resolve(details.data().type);
          else resolve();
        } catch (error) {
          resolve();
        }        
      }).catch((err) => {
        this.handleError(err)
      });   
    });
  }

  async saveAccountType(account, isNew) {
    return new Promise((resolve, reject) => {
      if (isNew) {
        this.db.collection('users').doc(this.uid).set({
          type: account,
          limit: this.userLimit ? this.userLimit : this.proLimit
        }).then(details => {
          this.accountType = account;
          resolve();
        });  
      } else {
        this.db.collection('users').doc(this.uid).update({
          type: account,
          limit: this.userLimit ? this.userLimit : this.proLimit
        }).then(details => {
          this.accountType = account;
          resolve();
        });  
      }
      
    });
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

  async upgradeClientLimit() {
    return new Promise((resolve, reject) => {
      if (!this.userLimit) {
        this.db.collection('users').doc(this.uid).set({
          limit: this.proLimit + 5,
          type: this.accountType ? this.accountType : 0
        }).then(details => {
          this.userLimit = this.proLimit + 5;
          resolve();
        });  
      } else {
        let limit = this.userLimit + 5;
        this.db.collection('users').doc(this.uid).update({
          limit: limit,
          type: this.accountType
        }).then(details => {
          this.userLimit = limit;
          resolve();
        });  
      }
      
    });
  }

  async addClient(client) {
    let image = "https://ui-avatars.com/api/?background=f3f3f3&name="+client.name;//await this.getAvatar(client);
    client.uuid = uuidv4();
    //let ref = this.uploadImage(image, client.uuid);
    let clientRef = this.db.collection('users').doc(this.uid).collection('clients');
    return await clientRef.doc(uuidv4()).set({
      name: client.name,
      visits: [
        {
          date: moment(client.last_visit).format("MMM Do YYYY"),
          summary: client.summary ? client.summary : null,
          uuid: uuidv4()
        }
      ],
      image: image,
      uuid: client.uuid,
      phone_number: client.phone_number ? client.phone_number : null,
      pets: client.pets ? client.pets : [],
      location: {
        address: client.address ? client.address : null,
        city: client.city ? client.city : null,
        state: client.state ? client.state : null,
        country: client.country ? client.country : null,
        zip: client.zip ? client.zip : null
      }
    }).catch((err) => {
      this.handleError(err)
    });
  }

  async editClient(client) {
    let clientRef = this.db.collection('users').doc(this.uid).collection('clients');
    return await clientRef.doc(client.id).update({
      name: client.name,
      visits: client.visits,
      image: client.image,
      uuid: client.uuid,
      phone_number: client.phone_number ? client.phone_number : null,
      breed: client.breed ? client.breed : null,
      temperament: client.temperament ? client.temperament : null,
      location: client.location
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

  async addStylist(name) {
   let stylists = <any>await this.getStylists();
   console.log(stylists);
   stylists.push(name);

    this.db.collection('users').doc(this.uid).collection('stylists').doc(this.uid).set({
      stylists
   })
  }

  async getStylists() {
    return new Promise( (resolve, reject) => {
      this.db.collection('users').doc(this.uid).collection('stylists').get().then(function(docs) {
        if (docs.size == 0) {
          resolve([]);
        } else {
          docs.forEach(function(doc) {
            let temp = doc.data();
            if (temp.stylists)
            resolve(temp.stylists);
          });
        }
      });
  });
}

async saveStylists(stylists) {
  this.db.collection('users').doc(this.uid).collection('stylists').doc(this.uid).set({
    stylists
 })
}

  async getAllTemplates() {
    return new Promise( (resolve, reject) => {
      this.db.collection('users').doc(this.uid).collection('templates').get().then(function(docs) {
        docs.forEach(function(doc) {
          let template = doc.data();
          if (template.templates)
          resolve(template.templates);
        });
      });
    });
  }

  async saveTemplate(templates) {
    this.db.collection('users').doc(this.uid).collection('templates').doc(this.uid).set({
      templates
    })
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

  async getClientProfileImages(client) {
    return new Promise( async (resolve, reject) => {
      let storageRef = firebase.storage().ref();
      let imagesRef = await storageRef.child(this.uid).child(client.uuid).child("profile_photos").listAll();
      let imageUrls = [];
      for (let i = 0; i < imagesRef.items.length; i++) {
        imageUrls.push(await imagesRef.items[i].getDownloadURL())
      }
      resolve(imageUrls);
    })
  }

  async uploadImage(imageUri, uuid, flag) {
    return new Promise((resolve, reject) => {
      let storageRef = firebase.storage().ref();
      let imageRef;
      if (flag) {
        imageRef = storageRef.child(this.uid).child(uuid).child("profile_photos").child(moment().format());
      } else {
        imageRef = storageRef.child(this.uid).child(uuid).child(moment().format());
      }
      let uploadTask = imageRef.putString(imageUri, "data_url");

      uploadTask.on(
        "state_changed",
        (_snapshot: any) => {
          this.globalService.publishData({key: 'uploadStatus', value: _snapshot.bytesTransferred / _snapshot.totalBytes});
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

  async addClientAppointment(obj) {
    this.db.collection('users').doc(this.uid).collection('appointments').doc(this.uid).get().then((apps) => {
      let appointments = apps.data().appointments != undefined ? apps.data().appointments : [];
      appointments.push(obj);
      this.db.collection('users').doc(this.uid).collection('appointments').doc(this.uid).update({
        appointments: appointments
      })
    });    
  }

  async getAllAppointments() {
    return this.db.collection('users').doc(this.uid).collection('appointments').doc(this.uid).get().then((apps) => {
      return apps.data().appointments != undefined ? apps.data().appointments : [];
    })
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
