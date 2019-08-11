import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { TaskListsPage } from './task-lists.page';
import { ExpandableModule } from 'src/app/components/expandable/expandable.module';
import { TodoItemDetailsModule } from 'src/app/components/todo-item-details/todo-item-details.module';

const routes: Routes = [
  {
    path: '',
    component: TaskListsPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ExpandableModule,
    TodoItemDetailsModule,
    RouterModule.forChild(routes)
  ],
  declarations: [TaskListsPage]
})
export class TaskListsPageModule {}
