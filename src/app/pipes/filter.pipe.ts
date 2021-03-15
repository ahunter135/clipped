import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    if (value == 0) {
      return "Today";
    } else if (value == 1) {
      return "Tomorrow"
    } else if (value == 2) {
      return "Last 7 Days"
    } else if (value == 3) {
      return "All Upcoming"
    }
    return null;
  }

}
