import { Component, OnInit } from '@angular/core';
import { AlertController, ModalController, NavParams } from '@ionic/angular';
import { DbService } from 'src/app/services/db.service';
import { StorageService } from 'src/app/services/storage.service';
//import { Instagram } from '@ionic-native/instagram/ngx';
import { FileTransfer, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { File } from '@ionic-native/file/ngx';
import { Base64 } from '@ionic-native/base64/ngx';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { TextTemplateComponent } from 'src/app/modals/text-template/text-template.component';
import { AddAppointmentComponent } from 'src/app/modals/add-appointment/add-appointment.component';

@Component({
  selector: 'app-popover',
  templateUrl: './popover.component.html',
  styleUrls: ['./popover.component.scss'],
})
export class PopoverComponent implements OnInit {

  client;
  dismissPopover;
  text;
  visit;
  showInsta = false;
  inDetails = false;
  isPro = false;
  constructor(private dbService: DbService, private storage: StorageService, public navParams: NavParams,
    private fileTransfer: FileTransfer, private file: File, private base64: Base64, private iab: InAppBrowser,
    private alertController: AlertController, private modalCtrl: ModalController) {
    this.client = this.navParams.data.client;
    this.dismissPopover = this.navParams.data.popover;
    this.text = this.navParams.data.text;
    this.visit = this.navParams.data.visit ? this.navParams.data.visit : null;
    this.inDetails = this.navParams.data.inDetails ? this.navParams.data.inDetails : false
    this.isPro = this.storage.proMode;
    if (this.visit) {
      if (this.visit.image) {
        this.showInsta = true;
      }
    } 
  }

  ngOnInit() {
    
  }

  async sendSMS() {
    let modal = await this.modalCtrl.create({
      component: TextTemplateComponent,
      componentProps: {
        client: this.client
      }
    })
    modal.onDidDismiss().then(() => {
      this.dismissPopover.dismiss();
    });

    await modal.present();
  }

  async call() {
    let res = await this.presentAlertConfirm("Are you sure you would like to call this client?");
    if (res)
      this.iab.create('tel:'+ this.client.phone_number , '_system');
      this.dismissPopover.dismiss();
  }

  share() {
    const fileTransfer: FileTransferObject = this.fileTransfer.create();

    fileTransfer.download(this.visit.image, this.file.dataDirectory + "tempImage.png").then(async (entry) => {
      let file = await this.base64.encodeFile(entry.toURL());
      console.log(file);

      //this.insta.share('data:image/png;uhduhf3hfif33', 'Shared from the Clipped App')
      //.then(() => console.log('Shared!'))
      //.catch((error: any) => console.error(error));
    });
    
  }

  async add() {
    let modal = await this.modalCtrl.create({
      component: AddAppointmentComponent,
      componentProps: {
        client: this.client
      }
    })
    modal.onDidDismiss().then(() => {
      this.dismissPopover.dismiss();
    });

    await modal.present();
  }

  async delete() {
    let res = await this.presentAlertConfirm("Are you sure you would like to delete this client?");
    if (!res) {
      this.dismissPopover.dismiss();
      return;
    };
    if (this.text === "Delete Client") {
      for (let i = 0; i < this.storage.clients.length; i++) {
        if (this.storage.clients[i].uuid == this.client.uuid) {
          this.storage.clients.splice(i, 1);
        }
      }
      this.dbService.deleteClient(this.client);
    } else if (this.text === "Delete Visit") {
      for (let i = 0; i < this.client.visits.length; i++) {
        if (this.client.visits[i].uuid == this.visit.uuid) {
          this.client.visits.splice(i, 1);
          break;
        }
      }
      this.dbService.editClientVisit(this.client);
    }
    
    this.dismissPopover.dismiss({delete: true});
  }

  async presentAlertConfirm(message) {
    return new Promise(async (resolve, reject) => {
      const alert = await this.alertController.create({
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
