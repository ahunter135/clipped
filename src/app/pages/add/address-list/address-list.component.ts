import { Component, OnInit } from '@angular/core';
import { NavParams, PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-address-list',
  templateUrl: './address-list.component.html',
  styleUrls: ['./address-list.component.scss'],
})
export class AddressListComponent implements OnInit {
  items = [];
  constructor(private navParams: NavParams, private popoverCtrl: PopoverController) { }

  ngOnInit() {
    this.items = this.navParams.data.items;
  }

  selectAddress(item) {
    this.popoverCtrl.dismiss(item);
  }

}
