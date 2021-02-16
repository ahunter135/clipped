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
        else return this.storage.clients[i].name
      }
    }
    return null;
  }

}
