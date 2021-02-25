import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Tab4Page } from './tab4.page';

import { Tab4PageRoutingModule } from './tab4-routing.module';
import { ClientByIDPipe } from '../pipes/client-by-id.pipe';
import { ViewAppointmentComponent } from '../modals/view-appointment/view-appointment.component';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    Tab4PageRoutingModule
  ],
  declarations: [Tab4Page, ClientByIDPipe, ViewAppointmentComponent],
  entryComponents: [ViewAppointmentComponent]
})
export class Tab4PageModule {}
