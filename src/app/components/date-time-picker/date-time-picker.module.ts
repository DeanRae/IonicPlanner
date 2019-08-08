import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Ionic4DatepickerModule } from '@logisticinfotech/ionic4-datepicker';
import { IonicTimepickerModule } from 
'@logisticinfotech/ionic-timepicker';
import { DateTimePickerComponent } from './date-time-picker.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

@NgModule({
  declarations: [DateTimePickerComponent],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    Ionic4DatepickerModule,
    IonicTimepickerModule
  ],
  exports: [
    DateTimePickerComponent
  ]
})
export class DateTimePickerModule { }
