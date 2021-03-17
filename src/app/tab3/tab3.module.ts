import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Tab3Page } from './tab3.page';

import { Tab3PageRoutingModule } from './tab3-routing.module';
import { EditAccountComponent } from '../modals/edit-account/edit-account.component';
import { LottieModule } from 'ngx-lottie';

import player from 'lottie-web';
import { PipesModule } from '../pipes/pipes.module';
 
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
    Tab3PageRoutingModule,
    LottieModule.forRoot({ player: playerFactory }),
    PipesModule
  ],
  declarations: [Tab3Page],
  entryComponents: []
})
export class Tab3PageModule {}
