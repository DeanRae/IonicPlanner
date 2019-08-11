import { Component, OnInit } from '@angular/core';
import { ListManagementService } from 'src/app/services/todo/list-management.service';
import { AlertController, NavParams, ModalController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { TaskManagementService } from 'src/app/services/todo/task-management.service';
import { isNullOrUndefined } from 'util';
import { FormGroup, Validators, FormBuilder, FormControl, RequiredValidator } from '@angular/forms';
import * as moment from 'moment';
import { Task } from 'src/app/interfaces/task';
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

  constructor(private listManagementService: ListManagementService, private taskManagementService: TaskManagementService, public alertController: AlertController, private modalController:ModalController, private formBuilder: FormBuilder, private navParams: NavParams) {
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
        });
    }
  }

  ngOnInit() {
    
  }

  public async saveTask(taskForm: FormGroup): Promise<void> {
    if (!taskForm.valid) {
      console.log('Form is not valid yet, current value:', taskForm.value);
    } else {
      let task: Task = {
        title: this.title.value,
        listId: this.selectedList,
        location: this.location,
        startTime: this.startTime.value,
        endTime: this.endTime.value,
        allDay: this.allDay,
        isCompleted: false,
        description: this.description,
        subTasks: this.subTasks,
      }

      if (this.currentTask) {
        // update the task
        try {
          await this.taskManagementService.editTask(task, this.currentTask.id);
          console.log("Task: ", task.title, " Edited");
        }
        catch (error) {
          console.error("Error updating task: ", error);
        }
      } else {
        // create new task
        this.taskManagementService.createTask(task)
          .then(() => {
            console.log("Task: ", task.title, " Created")
          })
          .catch(error => {
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

  deleteSubTask(index: number) {
    this.subTasks.splice(index, 1);
    console.log("deleted subtask");
  }

  /**
   * Dismiss this modal
   */
  public dismissModal() {
    this.modalController.dismiss();
  }
}
