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
        else if (args[0] == 'timeEstimate') {
          if (this.storage.services[i].time) {
            return this.storage.services[i].time.hours.text.substring(0, this.storage.services[i].time.hours.text.length - 4) + " " + this.storage.services[i].time.minutes.text.substring(0, this.storage.services[i].time.minutes.text.length - 6);
          } else return '';
        }
        return this.storage.services[i].name;
      }
    }
    return null;
  }

}
