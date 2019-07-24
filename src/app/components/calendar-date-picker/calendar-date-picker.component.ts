import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Ionic4DatepickerModalComponent } from '@logisticinfotech/ionic4-datepicker';

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
    weeksList: [
      'Sun','Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'
    ],
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
      if (data == 'Invalid date') {
        console.log('hello');
      }
      console.log(data);
      this.selectedDate = data.data.date;
    });
}

  ngOnInit() {}

}
