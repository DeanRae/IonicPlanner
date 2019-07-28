import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TodoItemDetailsComponent } from './todo-item-details.component';
import { IonicModule } from '@ionic/angular';
import { CalendarDatePickerModule } from '../calendar-date-picker/calendar-date-picker.module';

@NgModule({
  declarations: [TodoItemDetailsComponent],
  imports: [
    CommonModule,
    IonicModule,
    CalendarDatePickerModule
  ],
  exports: [
    TodoItemDetailsComponent
  ]
})
export class TodoItemDetailsModule { }
