import { Pipe, PipeTransform } from '@angular/core';
import { StorageService } from '../services/storage.service';

@Pipe({
  name: 'service'
})
export class ServicePipe implements PipeTransform {
  constructor(private storage: StorageService) {}

  transform(value: unknown, ...args: unknown[]): unknown {
    for (let i = 0; i < this.storage.services.length; i++) {
      if (this.storage.services[i].id == value) {
        if (args[0] == 'price') return this.storage.services[i].price;
        return this.storage.services[i].name;
      }
    }
    return null;
  }

}
