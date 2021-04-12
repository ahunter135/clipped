import { CurrencyPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams, PickerController, Platform } from '@ionic/angular';
import { CalendarComponentOptions } from 'ion2-calendar';
import * as moment from 'moment-timezone';
import { DbService } from 'src/app/services/db.service';
import { StorageService } from 'src/app/services/storage.service';
import { Calendar } from '@ionic-native/calendar/ngx';
import { ServicePipe } from 'src/app/pipes/service.pipe';

@Component({
  selector: 'app-add-appointment',
  templateUrl: './add-appointment.component.html',
  styleUrls: ['./add-appointment.component.scss'],
})
export class AddAppointmentComponent implements OnInit {
  max = moment().add(4, 'y').format("YYYY-MM-DD");
  today = moment().format("YYYY-MM-DD");
  min = moment().format("YYYY-MM-DD");
  type: 'string';
  app_date = moment().format("YYYY-MM-DD");
  app_time;
  client;
  stylist;
  stylists = [];
  pet = [];
  service;
  pets = [];
  calendarOptions: CalendarComponentOptions;
  appointments = [];
  customService = <any>{
    price: '$0.00',
    name: '',
    time: {}
  };
  export = false;
  expanded = false;
  bookingsOnDay = [];
  passedApp;
  proMode = this.storage.proMode || this.dbService.bypassPro;
  isEdit = false;
  isReoccurring = false;
  reoccurringFrequency;
  reoccurringEndDate;
  multiColumnOptions = [
    [
      {text:'0 Hours',
      value: 0},
      {text: '1 Hour',
      value: 1},
      {text: '2 Hours',
      value: 2}
    ],
    [
      {text: '0 Minutes',
      value: 0},
      {text: '15 Minutes',
      value: 15},
      {text: '30 Minutes',
      value: 30},
      {text: '45 Minutes',
      value: 45},
    ]
  ]
  chosenTime;
  constructor(public modalCtrl: ModalController, private navParams: NavParams, private db: DbService, public storage: StorageService, private platform: Platform,
    private currency: CurrencyPipe, private dbService: DbService, private calendar: Calendar, private servicePipe: ServicePipe, private pickerController: PickerController) {
    this.client = this.navParams.data.client;
    this.passedApp = this.navParams.data.passedApp;
    this.isEdit = this.navParams.data.isEdit ? true : false;
  }

  async ngOnInit() {
    this.stylists = <any>await this.db.getStylists();
    await this.dbService.getAllServices();
    for (let i = 0; i < this.client.pets.length; i++) {
      if (this.client.pets[i].isActive || this.client.pets[i].isActive == undefined)
        this.pets.push(this.client.pets[i]);
    }
    if (this.passedApp) {
      if (Array.isArray(this.passedApp.service)) {
        this.service = [];
        for (let i = 0; i < this.storage.services.length; i++) {
          for (let j = 0; j < this.passedApp.service.length; j++) {
            if (this.passedApp.service[j] == this.storage.services[i].id) {
              this.service.push(this.passedApp.service[j]);
            }
          }
        }
      } else {
        this.storage.services.forEach(service => {
          if (service.id == this.passedApp.service) {
            this.service = service.id;
          }
        })
      } 

      let obj = [];
      for (let i = 0; i < this.pets.length; i++) {
        if (this.passedApp.pet.name) {
          if (this.passedApp.pet.name.includes(this.pets[i].name)) {
            obj.push(this.pets[i]);
          }
        } else {
          if (this.passedApp.pet.includes(this.pets[i].name)) {
            obj.push(this.pets[i]);
          }
        }
      }
      this.pet = obj;

      if (this.isEdit) {
        this.app_date = moment(this.passedApp.date).format("YYYY-MM-DD");
        this.app_time = this.passedApp.date;
      }
    } else
      this.pet = [this.pets[0]];
    await this.dbService.getAllAppointments();
    this.appointments = this.storage.appointments;
    let config = [];
    for (let i = 0; i < this.appointments.length; i++) {
      let date = moment(this.appointments[i].date);
      config.push({
        date: date.toDate(),
        cssClass: 'unavailableDay'
      });

      if (moment(date.format("MM/DD/YYYY")).isSame(moment(this.app_date).format('MM/DD/YYYY'))) {
        this.bookingsOnDay.push(this.appointments[i]);
      }
    }

    this.calendarOptions = {
      daysConfig: config,
      from: new Date(2010, 0, 1)
    }
  }

  expandItem(): void {
    this.expanded = !this.expanded;
  }

  onChange($event) {
    this.bookingsOnDay = [];
    for (let i = 0; i < this.appointments.length; i++) {
      let date = moment(this.appointments[i].date);
      if (moment(date.format("MM/DD/YYYY")).isSame(moment(this.app_date).format('MM/DD/YYYY'))) {
        this.bookingsOnDay.push(this.appointments[i]);
      }
    }
  }

  async submit() {
    let petObjs = {
      name: "",
      image: false
    };
    for (let i = 0; i < this.pet.length; i++) {
      for (let j = 0; j < this.pets.length; j++) {
        if (this.pet[i].name == this.pets[j].name) {
          petObjs.name += this.pets[j].name + ", ";
          if (this.pets[j].image) petObjs.image = this.pets[j].image;
          break;
        }
      }
    }
    petObjs.name = petObjs.name.substring(0, petObjs.name.length - 2);

    let chosenDate = moment(this.app_date).format("MM/DD/YYYY");
    let time = moment(this.app_time).format("hh:mm a");
    let appointmentDate = moment(chosenDate + " " + time).toISOString();
    if (!this.app_date || !this.app_time || !this.pet || !this.service) {
      return;
    }
    if (this.isReoccurring) {
      if (!this.reoccurringEndDate || !this.reoccurringFrequency) {
        return;
      }
      chosenDate = moment(this.reoccurringEndDate).format("MM/DD/YYYY");
    }
    let obj = <any>{
      date: appointmentDate,
      timezone: moment.tz.guess(),
      pet: petObjs,
      client: this.client.id,
      service: <any>{},
      isReoccurring: this.isReoccurring, 
      reoccurringEndDate: moment(chosenDate + " " + time).toISOString(),
      reoccurringFrequency: this.reoccurringFrequency,
      deleted: false,
      cancelled: false,
      confirmed: false
    }
    if (this.service == 0) {
      obj.service = await this.dbService.addService(this.customService);
    } else obj.service = this.service
    
    if (this.isEdit) {
      obj.app = this.passedApp.app;
    }

    if (obj.app) {
      if (obj.app.calendarEventId) {
        let id = await this.exportToCalendar(obj);
        obj.calendarEventId = id;
      }
    } else if (this.export) {
      let id = await this.exportToCalendar(obj);
      obj.calendarEventId = id;
    }

    if (!this.isEdit) {
      if (!this.isReoccurring)
        this.db.addClientAppointment(obj);
      else this.db.addClientReoccurringAppointments(obj);
    } else { 
      this.db.editClientAppointment(obj);
    }

    
    this.modalCtrl.dismiss();
  }

  async exportToCalendar(object) {
    let cals = await this.calendar.listCalendars();

    let found = false;
    for (let i = 0; i < cals.length; i++) {
      if (cals[i].name == 'Clipped') {
        found = true;
        break;
      }
    }
    if (this.isEdit) {
      this.calendar.deleteEventById(object.app.calendarEventId);
    }

    if (!found) {
      await this.calendar.createCalendar({
        calendarName: 'Clipped',
        calendarColor: '#ffdac1'
      });
    }
    let calOptions = <any>{};
    if (this.platform.is('android')) {
      calOptions.calendarId = cals[cals.length -1].id
    }

    if (this.isReoccurring) {
      if (this.reoccurringFrequency == 0)
        calOptions.recurrence = "weekly";
      else if (this.reoccurringFrequency == 1) 
        calOptions.recurrence = "monthly";
      else if (this.reoccurringFrequency == 3) 
        calOptions.recurrence = "yearly"; 

      let time = moment(this.app_time).format("hh:mm a");
      let chosenDate = moment(this.reoccurringEndDate).format("MM/DD/YYYY");
      
      calOptions.recurrenceEndDate = moment(chosenDate + " " + time).toDate();
    }
    
    let temp = <string>this.servicePipe.transform(object.service, 'timeEstimate');
    let hours = temp.split("H")[0];
    let minutes = temp.split("M")[0];
    minutes = minutes.split("H ")[1];
    let endDate = moment(object.date).add(hours, 'hours').add(minutes, 'minutes').toDate();
    let startDate = moment(object.date).toDate();
    let response = await this.calendar.createEventWithOptions(
        "Appointment for " + this.client.name + " & " + object.pet.name,
        this.client.location.address,
        "", startDate, endDate, calOptions
      )    
    return response;
  }

  async openPicker(numColumns = 1, numOptions = 5, columnOptions = this.multiColumnOptions){
    const picker = await this.pickerController.create({
      columns: this.getColumns(numColumns, numOptions, columnOptions),
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Confirm',
          handler: (value) => {

            this.customService.time = {
              hours: {
                value: value.col0.value,
                text: value.col0.text
              },
              minutes: {
                value: value.col1.value,
                text: value.col1.text
              }
            }
            this.chosenTime = value.col0.text + " " + value.col1.text;
          }
        }
      ]
    });

    await picker.present();
  }

 getColumns(numColumns, numOptions, columnOptions) {
    let columns = [];
    for (let i = 0; i < numColumns; i++) {
      columns.push({
        name: `col${i}`,
        options: this.getColumnOptions(i, numOptions, columnOptions)
      });
    }

    return columns;
  }

 getColumnOptions(columnIndex, numOptions, columnOptions) {
    let options = [];
    for (let i = 0; i < numOptions; i++) {
      if (columnOptions[columnIndex][i % numOptions]) {
        options.push({
          text: columnOptions[columnIndex][i % numOptions].text,
          value: columnOptions[columnIndex][i % numOptions].value
        })
      }
      
    }

    return options;
  }

  formatPrice(ev) {
    let amount = this.currency.transform(this.customService.price, '$');

    this.customService.price = amount.toString();
  }

  erasePrice() {
    this.customService.price = "";
  }
}
