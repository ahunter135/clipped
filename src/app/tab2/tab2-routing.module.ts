import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Tab2Page } from './tab2.page';

const routes: Routes = [
  {
    path: '',
    component: Tab2Page,
  },
  {
    path: 'details',
    loadChildren: () => import('../pages/details/details.module').then( m => m.DetailsPageModule)
  },
  {
    path: 'settings',
    loadChildren: () => import('../tab3/tab3.module').then(m => m.Tab3PageModule)
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class Tab2PageRoutingModule {}
