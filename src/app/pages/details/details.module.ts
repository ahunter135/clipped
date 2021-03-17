import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DetailsPageRoutingModule } from './details-routing.module';

import { DetailsPage } from './details.page';
import { PopoverComponent } from './popover/popover.component';
import { VisitsComponent } from 'src/app/modals/visits/visits.component';
import { CropImageComponent } from 'src/app/modals/crop-image/crop-image.component';
import { ImageCropperModule } from 'ngx-image-cropper';
import { TextTemplateComponent } from 'src/app/modals/text-template/text-template.component';
import { AddAppointmentComponent } from 'src/app/modals/add-appointment/add-appointment.component';
import { CalendarModule } from 'ion2-calendar';
import { ExpandableComponent } from 'src/app/components/expandable/expandable.component';
import { ClientByIDPipe } from 'src/app/pipes/client-by-id.pipe';
import { ComponentsModule } from 'src/app/components/components.module';
import { PipesModule } from 'src/app/pipes/pipes.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DetailsPageRoutingModule,
    ImageCropperModule,
    CalendarModule,
    ComponentsModule,
    PipesModule
  ],
  declarations: [PopoverComponent, VisitsComponent, CropImageComponent, TextTemplateComponent, AddAppointmentComponent],
  entryComponents: [VisitsComponent, CropImageComponent, TextTemplateComponent, AddAppointmentComponent]
})
export class DetailsPageModule {}
