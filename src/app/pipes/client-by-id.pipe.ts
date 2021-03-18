import { Pipe, PipeTransform } from '@angular/core';
import { StorageService } from '../services/storage.service';

@Pipe({
  name: 'clientByID'
})
export class ClientByIDPipe implements PipeTransform {
  constructor(private storage: StorageService) {}

  transform(value: unknown, ...args: unknown[]): unknown {
    for (let i = 0; i < this.storage.clients.length; i++) {
      if (this.storage.clients[i].id == value) {
        if (args[0] == 'img') return this.storage.clients[i].image;
        else if (args[0] == 'address') return this.storage.clients[i].location.address;
        else if (args[0] == 'address2') return this.storage.clients[i].location.address2;
        else if (args[0] == 'full') return this.storage.clients[i];
        else return this.storage.clients[i].name

        break;
      }
    }
    return null;
  }

}
