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

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DetailsPageRoutingModule,
    ImageCropperModule
  ],
  declarations: [PopoverComponent, VisitsComponent, CropImageComponent],
  entryComponents: [VisitsComponent, CropImageComponent]
})
export class DetailsPageModule {}
