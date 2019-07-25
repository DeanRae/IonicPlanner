import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Ionic4DatepickerModalComponent } from '@logisticinfotech/ionic4-datepicker';
import * as moment from 'moment';

@Component({
  selector: 'app-calendar-date-picker',
  templateUrl: './calendar-date-picker.component.html',
  styleUrls: ['./calendar-date-picker.component.scss'],
})
export class CalendarDatePickerComponent implements OnInit {
  selectedDate: any;

  datePickerObj: any = {
    closeOnSelect: true,
    mondayFirst: true,
    titleLabel: 'Select a Date',
    monthsList: [ 
      'January', 'February', 'March', 'April', 'May','June', 'July', 'August', 'September', 'October', 'November', 'December'
    ],
    weeksList: [
      'Sun','Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'
    ],
    dateFormat: 'D MMMM YYYY',
    momentLocale: 'en-NZ'
  }


  constructor(public modalCtrl: ModalController) { }

  async openDatePicker() {
    const datePickerModal = await this.modalCtrl.create({
      component: Ionic4DatepickerModalComponent,
      cssClass: 'li-ionic4-datePicker',
      componentProps: { 'objConfig': this.datePickerObj }
  });
  await datePickerModal.present();
  datePickerModal.onDidDismiss()
    .then((data) => {
      // this.isModalOpen = false;
      if (data.data.date == 'Invalid date') {
        this.selectedDate = moment(new Date()).format('D MMMM YYYY');
        console.log(this.selectedDate);
      } else {
        this.selectedDate = data.data.date;
        console.log(this.selectedDate);
      }
      
      
    });
}

  ngOnInit() {}

}
