import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Tab4Page } from './tab4.page';
// import { IonicPullupModule } from 'ionic-pullup';

import { Tab4PageRoutingModule } from './tab4-routing.module';
import { ClientByIDPipe } from '../pipes/client-by-id.pipe';
import { ViewAppointmentComponent } from '../modals/view-appointment/view-appointment.component';
import { SelectClientComponent } from '../modals/select-client/select-client.component';
import { FilterPipe } from '../pipes/filter.pipe';
import { CalendarModule } from 'ion7-calendar';
import { ComponentsModule } from '../components/components.module';
import { PipesModule } from '../pipes/pipes.module';

@NgModule({
    imports: [
        IonicModule,
        CommonModule,
        FormsModule,
        Tab4PageRoutingModule,
        // IonicPullupModule,
        CalendarModule,
        ComponentsModule,
        PipesModule
    ],
    declarations: [Tab4Page, ViewAppointmentComponent, SelectClientComponent]
})
export class Tab4PageModule {}
