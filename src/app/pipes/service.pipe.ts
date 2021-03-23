import { Pipe, PipeTransform } from '@angular/core';
import { StorageService } from '../services/storage.service';

@Pipe({
  name: 'service'
})
export class ServicePipe implements PipeTransform {
  constructor(private storage: StorageService) {}

  transform(value: any, ...args: unknown[]): unknown {
    for (let i = 0; i < this.storage.services.length; i++) {
      if (Array.isArray(value)) {
        let str = "";
        let total = 0;
        for (let j = 0; j < value.length; j++) {
          if (this.storage.services[i].id == value[j]) {
            if (args[0] == 'price') {
              str += (this.storage.services[i].price + ", ");
              console.log(str);
            }
            else if (args[0] == 'timeEstimate') {
              if (this.storage.services[i].time) {
                str += (this.storage.services[i].time.hours.text.substring(0, this.storage.services[i].time.hours.text.length - 4) + " " + this.storage.services[i].time.minutes.text.substring(0, this.storage.services[i].time.minutes.text.length - 6) + ", ");
              } else str+= '';
            }
            else str += (this.storage.services[i].name + ', ');
          }
          console.log(str);
        }
       return str.substring(str.length - 2);        
      } else {
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
    }
    return null;
  }

}
