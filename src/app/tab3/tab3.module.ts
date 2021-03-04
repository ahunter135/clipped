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
    LottieModule.forRoot({ player: playerFactory })
  ],
  declarations: [Tab3Page, EditAccountComponent],
  entryComponents: [EditAccountComponent]
})
export class Tab3PageModule {}
