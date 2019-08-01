import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TodoItemDetailsComponent } from './todo-item-details.component';
import { IonicModule } from '@ionic/angular';
import { CalendarDatePickerModule } from '../calendar-date-picker/calendar-date-picker.module';
import { FormsModule } from '@angular/forms';
import { TimePickerComponent } from '../time-picker/time-picker.component';
import { TimePickerModule } from '../time-picker/time-picker.module';

@NgModule({
  declarations: [TodoItemDetailsComponent],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    TimePickerModule,
    CalendarDatePickerModule
  ],
  exports: [
    TodoItemDetailsComponent
  ]
})
export class TodoItemDetailsModule { }
