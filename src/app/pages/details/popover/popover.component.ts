import { Component, OnInit } from '@angular/core';
import { NavParams } from '@ionic/angular';
import { DbService } from 'src/app/services/db.service';
import { StorageService } from 'src/app/services/storage.service';
import { Instagram } from '@ionic-native/instagram/ngx';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { File } from '@ionic-native/file/ngx';
import { Base64 } from '@ionic-native/base64/ngx';

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
  constructor(private dbService: DbService, private storage: StorageService, public navParams: NavParams, private insta: Instagram,
    private fileTransfer: FileTransfer, private file: File, private base64: Base64) {
    this.client = this.navParams.data.client;
    this.dismissPopover = this.navParams.data.popover;
    this.text = this.navParams.data.text;
    this.visit = this.navParams.data.visit ? this.navParams.data.visit : null;
  }

  ngOnInit() {
    
  }

  share() {
    const fileTransfer: FileTransferObject = this.fileTransfer.create();

    fileTransfer.download(this.visit.image, this.file.dataDirectory + "tempImage.png").then(async (entry) => {
      let file = await this.base64.encodeFile(entry.toURL());
      console.log(file);

      this.insta.share('data:image/png;uhduhf3hfif33', 'Shared from the Clipped App')
      .then(() => console.log('Shared!'))
      .catch((error: any) => console.error(error));
    });
    
  }

  delete() {
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

}
