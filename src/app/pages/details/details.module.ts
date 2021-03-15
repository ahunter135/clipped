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

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DetailsPageRoutingModule,
    ImageCropperModule,
    CalendarModule
  ],
  declarations: [PopoverComponent, VisitsComponent, CropImageComponent, TextTemplateComponent, AddAppointmentComponent],
  entryComponents: [VisitsComponent, CropImageComponent, TextTemplateComponent, AddAppointmentComponent]
})
export class DetailsPageModule {}
