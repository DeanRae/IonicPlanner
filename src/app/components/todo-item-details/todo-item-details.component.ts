import { Component, OnInit } from '@angular/core';
import { ListManagementService } from 'src/app/services/todo/list-management.service';
import { AlertController } from '@ionic/angular';
@Component({
  selector: 'app-todo-item-details',
  templateUrl: './todo-item-details.component.html',
  styleUrls: ['./todo-item-details.component.scss'],
})
export class TodoItemDetailsComponent implements OnInit {
  public listTitleList: Array<any>;
  public startDate: string;
  public endDate: string;
  public subTasks: Array<any> = [];
  constructor(private listManagementService: ListManagementService, public alertController: AlertController) { }

  ngOnInit() {
    console.log("in to do " + this.listManagementService.getUserLists());
    this.listManagementService
      .getUserLists()
      .get()
      .then(userListSnapshot => {
        this.listTitleList = [];
        userListSnapshot.forEach(snap => {
          this.listTitleList.push({
            id: snap.id,
            title: snap.data().title,
          });
          return false;
        });
      });
  }

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

  deleteSubTask(index:number) {
    this.subTasks.splice(index, 1);
    console.log("deleted subtask");
  }
}
