import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { DbService } from '../services/db.service';
import { GlobalService } from '../services/global.service';
import { StorageService } from '../services/storage.service';
import * as moment from 'moment';
@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {
  searchterm = "";
  clients = [];
  proMode = this.storage.proMode;
  temp = this.storage.clients;
  constructor(public storage: StorageService, private router: Router, public globalService: GlobalService, public dbService: DbService) {}

  ngOnInit() {
    this.globalService.getObservable().subscribe(async (data) => {
      if (data.key === 'pro') {
        this.proMode = data.value;
      }
    })
  }

  async ionViewDidEnter() {
    await this.dbService.getClients();
    for (let i = 0; i < this.storage.clients.length; i++) {
      this.storage.clients[i].visits.sort(this.sortByProperty("date"));
    }
    this.temp = this.storage.clients;
  }

  sortByProperty(property){  
    return function(a,b){  
      let date1 = moment(a[property], "MMM Do YYYY");
      let date2 = moment(b[property], "MMM Do YYYY");

       if(date1.isBefore(date2))  
          return 1;  
       else if(date1.isAfter(date2))  
          return -1;  
      
       return 0;  
    }  
 }

 async openSettings() {
  this.router.navigate(['/tabs/tab2/settings']);
}

  async refresh(event) {
    await this.dbService.getClients();
    event.target.complete();
    this.temp = this.storage.clients;
  }

  goToDetails(client) {
    this.storage.data = client;
    this.router.navigate(['/tabs/tab2/details']); 
  }

  search(term) {
    console.log(this.temp);
    //TODO FIX THIS
    if (term == "" || term == null) {
      this.storage.clients = this.temp;
      return;
    }
    this.storage.clients = [];
    for (let i = 0; i < this.temp.length; i++) {
      if (this.temp[i].name.toLowerCase().includes(term.toLowerCase())) {
        this.storage.clients.push(this.temp[i]);
      } else {
        for (let j = 0; j < this.temp[i].pets.length; j++) {
          if (this.temp[i].pets[j].name.toLowerCase().includes(term.toLowerCase())) {
            this.storage.clients.push(this.temp[i]);
          }
        }
      }
    }
  }

  resetSearch() {
    this.storage.clients = this.temp;
  }
}
