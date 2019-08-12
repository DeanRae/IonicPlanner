import { Component, OnInit } from '@angular/core';
import { ListManagementService } from 'src/app/services/todo/list-management.service';
import { AlertController, NavParams, ModalController, ToastController, LoadingController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { TaskManagementService } from 'src/app/services/todo/task-management.service';
import { isNullOrUndefined } from 'util';
import { FormGroup, Validators, FormBuilder, FormControl } from '@angular/forms';
import * as moment from 'moment';
import { Task } from 'src/app/interfaces/task';
import { DateTimePickerComponent } from '../date-time-picker/date-time-picker.component';
import { discardPeriodicTasks } from '@angular/core/testing';
@Component({
  selector: 'app-todo-item-details',
  templateUrl: './todo-item-details.component.html',
  styleUrls: ['./todo-item-details.component.scss'],
})
export class TodoItemDetailsComponent implements OnInit {
  public listTitleList: Array<any>;
  public subTasks: Array<any> = [];
  public currentTask: any; // initialised if an id was passed to this component to populate fields with existing info else null
  public selectedList: any = '';
  public taskForm: FormGroup;
  public location: string = '';
  public description: string = '';
  public allDay: boolean = false;
  public completionRate: number = 0;

  constructor(private listManagementService: ListManagementService, private taskManagementService: TaskManagementService, public alertController: AlertController, private modalController: ModalController, private formBuilder: FormBuilder, private navParams: NavParams, private toastController: ToastController) {
    // create form validation for user inputted date
    this.taskForm = this.formBuilder.group({
      startTime: [moment(new Date()).format("D MMMM YYYY h:mm a"), this.dateValidator("D MMMM YYYY h:mm a")],
      endTime: [moment(new Date()).format("D MMMM YYYY h:mm a"), this.dateValidator("D MMMM YYYY h:mm a")],
      title: ['', Validators.required]
    });

    // this provides the lists that the user has so that they can select which list their task belongs to later
    this.listManagementService
      .getUserLists()
      .onSnapshot(userListSnapshot => {
        this.listTitleList = [];
        userListSnapshot.forEach(snap => {
          if (snap.data().title != "All Tasks") {
            this.listTitleList.push({
              id: snap.id,
              title: snap.data().title,
            });
          }
        });
      });

    // will check if an id was passed to this component and uses the id to 
    //populate the form based on user's previous input - (for their editing convenience)
    let taskId: string = this.navParams.get('id');

    if (taskId) {
      this.taskManagementService
        .getTask(taskId)
        .get()
        .then(taskSnapshot => {
          this.currentTask = taskSnapshot.data();
          this.currentTask.id = taskSnapshot.id;
          this.subTasks = taskSnapshot.get("subTasks");
          this.selectedList = taskSnapshot.get("listId");
          this.location = taskSnapshot.get("location");
          this.description = taskSnapshot.get("description");
          this.title.setValue(taskSnapshot.get("title"));
          this.startTime.setValue(taskSnapshot.get("startTime"));
          this.endTime.setValue(taskSnapshot.get("endTime"));
          this.allDay = taskSnapshot.get("allDay");
          this.completionRate = taskSnapshot.get("completionRate")*100;
        });
    }
  }

  ngOnInit() {

  }

  public async saveTask(taskForm: FormGroup): Promise<void> {
    if (!taskForm.valid) {
      console.log('Form is not valid yet, current value:', taskForm.value);
    } else {
      let startAsDate = new Date(this.startTime.value);
      let UTCStart = new Date(Date.UTC(startAsDate.getUTCFullYear(), startAsDate.getUTCMonth(), startAsDate.getUTCDate()));
      let endAsDate = new Date(this.endTime.value);
      let UTCEnd = new Date(Date.UTC(endAsDate.getUTCFullYear(), endAsDate.getUTCMonth(), endAsDate.getUTCDate()));
      let task: Task = {
        title: this.title.value,
        listId: this.selectedList,
        location: this.location,
        startTime: this.allDay ? UTCStart: this.startTime.value,
        endTime: this.allDay ? UTCEnd: this.endTime.value,
        allDay: this.allDay,
        isCompleted: false,
        description: this.description,
        subTasks: this.subTasks,
        completionRate: this.completionRate/100
      }

      if (this.currentTask) {
        // update the task
        try {
          await this.taskManagementService.editTask(task, this.currentTask.id);
          this.presentToast('The task: ' + task.title + ' has been successfully updated');
          this.dismissModal();
        }
        catch (error) {
          this.presentToast('Error updating task:  ' + task.title);
          console.error("Error updating task: ", error);
        }
      } else {
        // create new task
        this.taskManagementService.createTask(task)
          .then(() => {
            this.presentToast('The task: ' + task.title + ' has been successfully created');
            this.dismissModal();
          })
          .catch(error => {
            this.presentToast('Error creating task ' + task.title);
            console.error("Error creating task: ", error);
          })
      }
    }
  }
  /**
   * date validator used to validate form. Code from 
   * https://stackoverflow.com/questions/51905033/pre-populating-and-validating-date-in-angular-6-reactive-form
   * @param format 
   */
  dateValidator(format): any {
    return (control: FormControl): { [key: string]: any } => {
      if (isNullOrUndefined(control.value) || control.value == '') {
        return null;
      }
      const val = moment(control.value, format, true);

      if (!val.isValid()) {
        return { invalidDate: true };
      }

      return null;
    };
  }

  /**
   * Returns the startTime form control
   */
  get startTime() { return this.taskForm.get('startTime'); }

  /**
   * Returns the endTime form control
   */
  get endTime() { return this.taskForm.get('endTime'); }

  /**
   * Returns the title form control
   */
  get title() { return this.taskForm.get('title'); }

  async addSubTask(): Promise<void> {
    const alert = await this.alertController.create({
      subHeader: 'Create Sub-Task',
      inputs: [
        {
          type: 'text',
          name: 'subTask',
          placeholder: 'Enter sub-task',
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Add',
          handler: newSubTask => {
            this.subTasks.push({
              subTask: newSubTask.subTask,
              isChecked: false,
            });
            console.log("New sub-task added: " + newSubTask.subTask);
          },
        },
      ],
      backdropDismiss: false,
    });
    await alert.present();
  }

  /**
   * Deletes a subtask from the task's list of subtasks
   * @param index 
   */
  deleteSubTask(index: number) {
    this.subTasks.splice(index, 1);
  }

  async presentListCreatorAlert() {
    const alert = await this.alertController.create({
      subHeader: 'Create a new list',
      inputs: [
        {
          type: 'text',
          name: 'listName',
          placeholder: 'Enter list name',
        }
      ],
      buttons: [
        { text: 'Cancel' },
        {
          text: 'Save',
          handler: data => {
            this.listManagementService.createList(data.listName)
              .then(() => {
                this.presentToast('List ' + data.listName + ' Created');
              });
          },
        },
      ],
    });
    await alert.present();
  }

  /**
   * Dismiss this modal
   */
  public dismissModal() {
    this.modalController.dismiss();
  }

  /**
   * Presents the toast used to tell the user that task has been either
   * created or edited.
   * @param message 
   */
  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'middle',
      color: 'dark',
      showCloseButton: true
    });
    toast.present();
  }

}
