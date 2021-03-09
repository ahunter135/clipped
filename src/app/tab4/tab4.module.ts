import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Tab4Page } from './tab4.page';
import { IonicPullupModule } from 'ionic-pullup';

import { Tab4PageRoutingModule } from './tab4-routing.module';
import { ClientByIDPipe } from '../pipes/client-by-id.pipe';
import { ViewAppointmentComponent } from '../modals/view-appointment/view-appointment.component';
import { SelectClientComponent } from '../modals/select-client/select-client.component';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    Tab4PageRoutingModule,
    IonicPullupModule
  ],
  declarations: [Tab4Page, ClientByIDPipe, ViewAppointmentComponent, SelectClientComponent],
  entryComponents: [ViewAppointmentComponent, SelectClientComponent]
})
export class Tab4PageModule {}
