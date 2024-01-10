import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Tab1Page } from './tab1.page';

import { Tab1PageRoutingModule } from './tab1-routing.module';
import { AddPage } from '../pages/add/add.page';
import { LottieModule, LottieCacheModule } from 'ngx-lottie';
import player from 'lottie-web';
 
// Note we need a separate function as it's required
// by the AOT compiler.
export function playerFactory() {
  return player;
}
@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    Tab1PageRoutingModule,
    LottieModule.forRoot({ player: playerFactory }),
  ],
  declarations: [Tab1Page, AddPage]
})
export class Tab1PageModule {}
