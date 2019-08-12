import { Component, OnInit } from '@angular/core';
import { ProfileService } from 'src/app/services/user/profile.service';
import { ListManagementService } from 'src/app/services/todo/list-management.service';
import { TaskManagementService } from 'src/app/services/todo/task-management.service';
import { TodoItemDetailsComponent } from 'src/app/components/todo-item-details/todo-item-details.component';
import { ModalController, ToastController, AlertController, ActionSheetController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  public userProfile: firebase.firestore.DocumentData;
  public lists: any = [{
    listName: 'dueToday',
    title: 'Tasks Due Today',
    tasks: [],
    open: true
  },
  {
    listName: 'startToday',
    title: 'Tasks Starting Today',
    tasks: [],
    open: false
  }]

  constructor(private profileService: ProfileService, private listManagementService: ListManagementService, private taskManagementService: TaskManagementService, private modalController: ModalController, private toastController: ToastController, private alertController: AlertController, private actionSheetController:ActionSheetController) {
    // set up dates
    let todaysDate = new Date();
    let tomorrowsDate = new Date();
    tomorrowsDate.setDate(todaysDate.getDate() + 1);

    // get user profile
    this.profileService
      .getUserProfile()
      .get()
      .then(userProfileSnapshot => {
        this.userProfile = userProfileSnapshot.data();
      });

    // set up tasks starting today and due today
    this.listManagementService.getUserAllTasksList()
      .collection("tasks")
      .where("isCompleted", "==", false)
      .onSnapshot(tasksStartingToday => {
        this.lists[0].tasks = [];
        this.lists[1].tasks = [];
        tasksStartingToday.forEach(task => {
          this.taskManagementService.
            getTask(task.id).get()
            .then(taskSnapshot => {
              // create a new task object
              return {
                id: task.id,
                title: taskSnapshot.get("title"),
                subTasks: taskSnapshot.get("subTasks"),
                listId: taskSnapshot.get("listId"),
                location: taskSnapshot.get("location"),
                description: taskSnapshot.get("description"),
                startTime: taskSnapshot.get("startTime"),
                endTime: taskSnapshot.get("endTime"),
                allDay: taskSnapshot.get("allDay"),
                isCompleted: taskSnapshot.get("isCompleted"),
                completionRate: taskSnapshot.get("completionRate")*100,
                createdTimestamp: taskSnapshot.get("createdTimestamp"),
                updatedTimestamp: taskSnapshot.get("updatedTimestamp"),
              };
            })
            .then(newTask => {
              if (this.isToday(new Date(newTask.startTime))) {
                // startToday
                this.lists[1].tasks.push({
                  details: newTask,
                  expanded: false
                });
              }
              if (this.isToday(new Date(newTask.endTime))) {
                // dueToday
                this.lists[0].tasks.push({
                  details: newTask,
                  expanded: false
                });
              }
            });
        });
      });

  }

  ngOnInit() {

  }

  isToday(someDate) {
    const today = new Date()
    return someDate.getDate() == today.getDate() &&
      someDate.getMonth() == today.getMonth() &&
      someDate.getFullYear() == today.getFullYear()
  }

  /**
 * Completes a task
 * @param task 
 * @param taskId 
 */
  completeTask(task: any, taskId: string) {
    this.taskManagementService.setTaskComplete(task, taskId)
      .then(() => {
        this.presentToast('Moved task: ' + task.title + ' to completed tasks');
      }).catch(error => {
        console.log('Error completing the task ', error);
      })
  }


  /**
   * Presents the toast that alerts the user when the action has been completed
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

  /**
   * Expands a task card to show more details
   * @param task 
   */
  expandCard(task: any): void {
    task.expanded = !task.expanded;
  }

  /**
   * Toggles the lists: dueToday, start
   */
  toggleList(index: number) {
    this.lists[index].open = !this.lists[index].open;

    if (!this.lists[index].open) {
      this.lists.filter((userListIndex) => userListIndex != index)
        .map(userList => {
          userList.tasks.map(task => {
            task.expanded = false;
          });
        });
    }
  }

  /**
   * Action sheet for the task "more" icon
   * @param task 
   */
  async presentTaskActionSheet(task: any) {
    const actionSheet = await this.actionSheetController.create({
      header: task.title,
      buttons: [{
        text: 'Delete',
        role: 'destructive',
        icon: 'trash',
        handler: () => {
          this.confirmTaskDeletionAlert(task);
        }
      },
      {
        text: 'Edit',
        icon: 'create',
        handler: () => {
          this.presentTaskModal(task.id);
        }
      } ,
      {
        text: 'Cancel',
        icon: 'close',
        role: 'cancel'
      }]
    });
    await actionSheet.present();
  }

   /**
   * Alert to confirm a task deletion
   * @param task 
   */
  async confirmTaskDeletionAlert(task: any) {
    const alert = await this.alertController.create({
      header: 'Confirm',
      message: 'Are you sure you want to delete the task ' + task.title + '?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary'
        }, {
          text: 'Confirm',
          handler: () => {
            this.taskManagementService.deleteTask(task.id)
              .then(() => {
                this.presentToast('Task ' + task.title + ' Deleted');
              });
          }
        }
      ]
    });

    await alert.present();
  }
}
