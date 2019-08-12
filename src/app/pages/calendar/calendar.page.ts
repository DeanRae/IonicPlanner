import { Component, OnInit, ViewChild } from '@angular/core';
import { ListManagementService } from 'src/app/services/todo/list-management.service';
import { Task } from 'src/app/interfaces/task';
import { TaskListsPage } from '../task-lists/task-lists.page';
import { TaskManagementService } from 'src/app/services/todo/task-management.service';
import { CalendarComponent } from 'ionic2-calendar/calendar';
import { AlertController, ModalController } from '@ionic/angular';
import * as moment from 'moment';
import { TodoItemDetailsComponent } from 'src/app/components/todo-item-details/todo-item-details.component';

/**
 * Based on tut from https://devdactic.com/ionic-4-calendar-app/
 */
@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.page.html',
  styleUrls: ['./calendar.page.scss'],
})
export class CalendarPage implements OnInit {
  eventSource = [];
  viewTitle;
  calendar = {
    mode: 'month',
    currentDate: new Date(),
  }
  @ViewChild(CalendarComponent) myCal: CalendarComponent;

  constructor(private listManagementService: ListManagementService, private taskManagementService: TaskManagementService, private alertController:AlertController, private modalController:ModalController) {
    this.listManagementService
      .getUserAllTasksList()
      .collection("uncompleted_tasks")
      .onSnapshot(userListSnapshot => {
        this.eventSource = [];
        userListSnapshot.forEach(snap => {
          this.taskManagementService.getTask(snap.id)
            .get()
            .then(taskSnapshot => {
              let task: any = taskSnapshot.data();
              let startAsDate = new Date(taskSnapshot.get("startTime"));
              let UTCStart = new Date(Date.UTC(startAsDate.getUTCFullYear(), startAsDate.getUTCMonth(), startAsDate.getUTCDate()));
              let endAsDate = new Date(taskSnapshot.get("endTime"));
              let UTCEnd = new Date(Date.UTC(endAsDate.getUTCFullYear(), endAsDate.getUTCMonth(), endAsDate.getUTCDate()));

              task.id = snap.id;
              task.startTime = taskSnapshot.get("allDay") ? UTCStart:startAsDate;
              task.endTime = taskSnapshot.get("allDay") ? UTCEnd : endAsDate;
              task.title = taskSnapshot.get("title");
              task.allDay = taskSnapshot.get("allDay");
              this.eventSource.push(task);
              this.myCal.loadEvents();
            });
        });
      });
  }

  ngOnInit() {

  }

  onViewTitleChanged(title: string) {
    this.viewTitle = title;
  }

  // Calendar event was clicked
  async onEventSelected(task) {
    // Use Angular date pipe for conversion
    let start = task.startTime;
    let end = task.endTime;

    const alert = await this.alertController.create({
      header: task.title,
      subHeader: 'Description: ' + task.description,
      message: 'From: ' + moment(start).format("D MMMM YYYY h:mm a") 
              + '<br>To: ' + moment(end).format("D MMMM YYYY h:mm a"),
      buttons: ['OK']
    });
    alert.present();
  }

  onTimeSelected(ev: any) {
    console.log('Selected time: ' + ev.selectedTime + ', hasEvents: ' +
      (ev.events !== undefined && ev.events.length !== 0) + ', disabled: ' + ev.disabled);
  }

  onCurrentDateChanged(event: Date) {
    console.log('current date change: ' + event);
  }

  onRangeChanged(ev: any) {
    console.log('range changed: startTime: ' + ev.startTime + ', endTime: ' + ev.endTime);
  }

  // Change current month/week/day
  next() {
    var swiper = document.querySelector('.swiper-container')['swiper'];
    swiper.slideNext();
  }

  back() {
    var swiper = document.querySelector('.swiper-container')['swiper'];
    swiper.slidePrev();
  }

  // Change between month/week/day
  changeMode(mode) {
    this.calendar.mode = mode;
  }

  today() {
    this.calendar.currentDate = new Date();
  }

    /**
   * Presents the task creation/edit modal
   */
  async presentTaskModal(taskId: string) {
    const modal = await this.modalController.create({
      component: TodoItemDetailsComponent,
      componentProps: {
        'id': taskId
      }
    });
    return await modal.present();
  }
}
