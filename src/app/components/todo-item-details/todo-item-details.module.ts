import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TodoItemDetailsComponent } from './todo-item-details.component';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DateTimePickerModule } from '../date-time-picker/date-time-picker.module';

@NgModule({
  declarations: [TodoItemDetailsComponent],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    DateTimePickerModule
  ],
  entryComponents: [
    TodoItemDetailsComponent,
  ],
  exports: [
    TodoItemDetailsComponent
  ]
})
export class TodoItemDetailsModule { }
