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
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class Tab1PageRoutingModule {}
