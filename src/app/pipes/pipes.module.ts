import { NgModule } from '@angular/core';
import { ClientByIDPipe } from './client-by-id.pipe';
import { FilterPipe } from './filter.pipe';
import { PhonePipe } from './phone.pipe';
import { ServicePipe } from './service.pipe';
@NgModule({
declarations: [
  ClientByIDPipe,
  FilterPipe,
  PhonePipe,
  ServicePipe
],
exports: [
    ClientByIDPipe,
    FilterPipe,
    PhonePipe,
    ServicePipe
],
providers: [
    FilterPipe,
    PhonePipe,
    ClientByIDPipe,
    ServicePipe
]
})
export class PipesModule { }