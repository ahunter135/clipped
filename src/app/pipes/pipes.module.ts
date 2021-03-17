import { NgModule } from '@angular/core';
import { ClientByIDPipe } from './client-by-id.pipe';
import { FilterPipe } from './filter.pipe';
import { PhonePipe } from './phone.pipe';
@NgModule({
declarations: [
  ClientByIDPipe,
  FilterPipe,
  PhonePipe
],
exports: [
    ClientByIDPipe,
    FilterPipe,
    PhonePipe
],
providers: [
    FilterPipe,
    PhonePipe,
    ClientByIDPipe
]
})
export class PipesModule { }