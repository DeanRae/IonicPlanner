import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Ionic4DatepickerModule } from '@logisticinfotech/ionic4-datepicker';
import { CalendarDatePickerComponent } from './calendar-date-picker.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [CalendarDatePickerComponent],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    Ionic4DatepickerModule
  ],
  exports: [
    CalendarDatePickerComponent
  ]
})
export class CalendarDatePickerModule { }
