import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddPage } from '../pages/add/add.page';
import { LoginPage } from '../pages/login/login.page';
import { Tab1Page } from './tab1.page';

const routes: Routes = [
  {
    path: '',
    component: Tab1Page,
  },
  {
    path: 'add',
    component: AddPage
  },
  {
    path: 'login',
    component: LoginPage
  },
  {
    path: 'services',
    loadChildren: () => import('../pages/services/services.module').then( m => m.ServicesPageModule)
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
export class Tab1PageRoutingModule {}
