import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EditAccountComponent } from '../modals/edit-account/edit-account.component';
import { Tab3Page } from './tab3.page';

const routes: Routes = [
  {
    path: '',
    component: Tab3Page,
  },
  {
    path: 'edit-account',
    component: EditAccountComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class Tab3PageRoutingModule {}
