import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TodoItemDetailsComponent } from './todo-item-details.component';
import { IonicModule } from '@ionic/angular';
import { CalendarDatePickerModule } from '../calendar-date-picker/calendar-date-picker.module';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [TodoItemDetailsComponent],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    CalendarDatePickerModule
  ],
  exports: [
    TodoItemDetailsComponent
  ]
})
export class TodoItemDetailsModule { }
