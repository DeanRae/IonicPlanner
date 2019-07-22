import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Ionic4DatepickerModule } from '@logisticinfotech/ionic4-datepicker';
import { CalendarDatePickerComponent } from './calendar-date-picker.component';

@NgModule({
  declarations: [CalendarDatePickerComponent],
  imports: [
    CommonModule,
    Ionic4DatepickerModule
  ],
  exports: [
    CalendarDatePickerComponent
  ]
})
export class CalendarDatePickerModule { }
