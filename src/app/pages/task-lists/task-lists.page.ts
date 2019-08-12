import { Component, OnInit } from '@angular/core';
import { ListManagementService } from 'src/app/services/todo/list-management.service';
import { TaskManagementService } from 'src/app/services/todo/task-management.service';
import { ModalController, ToastController, AlertController, ActionSheetController } from '@ionic/angular';
import { TodoItemDetailsComponent } from 'src/app/components/todo-item-details/todo-item-details.component';

@Component({
  selector: 'app-task-lists',
  templateUrl: './task-lists.page.html',
  styleUrls: ['./task-lists.page.scss'],
})
export class TaskListsPage implements OnInit {
  public userLists: any;

  constructor(private listManagementService: ListManagementService, private taskManagementService: TaskManagementService, private modalController: ModalController, private toastController: ToastController, private alertController: AlertController, private actionSheetController: ActionSheetController) {
    // set up the user's lists
    this.listManagementService
      .getUserLists()
      .orderBy("createdTimestamp")
      .onSnapshot(userListSnapshot => {
        this.userLists = [];
        userListSnapshot.forEach(snap => {
          let list = snap.data();
          list.id = snap.id;
          list.title = snap.get("title");
          list.subLists = [
            {
              title: "Uncompleted Tasks",
              open: false,
              tasks: []
            },
            {
              title: "Completed Tasks",
              open: false,
              tasks: []
            }
          ];
          this.userLists.push(list);
        });

        // Add the tasks to the lists
        this.listManagementService
          .getUserAllTasksList()
          .collection("tasks")
          .onSnapshot(allTasks => {
            this.userLists.forEach(list => {
              list.subLists.forEach(subList => {
                subList.tasks = [];
              });
            });
            allTasks.forEach(task => {
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
                  // add it to the completed/uncompleted lists of user-defined lists and....
                  if (newTask.listId) {
                    let taskList = this.userLists.find(list => list.id == newTask.listId);
                    taskList.subLists[newTask.isCompleted ? 1 : 0].tasks.push({
                      details: newTask,
                      expanded: false
                    });
                  }
                  // default list all_tasks
                  this.userLists[0].subLists[newTask.isCompleted ? 1 : 0].tasks.push({
                    details: newTask,
                    expanded: false
                  });
                });
            });
          });
      });

  }

  ngOnInit() {

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
      }, {
        text: 'Edit',
        icon: 'create',
        handler: () => {
          this.presentTaskModal(task.id);
        }
      },
      {
        text: 'Cancel',
        icon: 'close',
        role: 'cancel'
      }]
    });
    await actionSheet.present();
  }

  /**
   * Action sheet for when pressing the list "more" icon
   */
  async presentListActionSheet(list: any) {
    const actionSheet = await this.actionSheetController.create({
      header: list.title,
      buttons: [{
        text: 'Delete',
        role: 'destructive',
        icon: 'trash',
        handler: () => {
          this.confirmListDeletionAlert(list);
        }
      }, {
        text: 'Edit',
        icon: 'create',
        handler: () => {
          this.presentListCreatorAlert(
            list,
            'Edit List Name of ' + list.title,
            'EDIT'
          );
        }
      },
      {
        text: 'Cancel',
        icon: 'close',
        role: 'cancel'
      }]
    });
    await actionSheet.present();
  }

  /**
   * Alert to creat/edit a new list
   * @param list 
   * @param subHeader 
   * @param action 
   */
  async presentListCreatorAlert(list: any, subHeader: string, action: any) {
    const alert = await this.alertController.create({
      subHeader: subHeader,
      inputs: [
        {
          type: 'text',
          name: 'listName',
          placeholder: 'Enter list name',
          value: list ? list.title : '',
        }
      ],
      buttons: [
        { text: 'Cancel' },
        {
          text: 'Save',
          handler: data => {
            if (action == 'EDIT') {
              this.listManagementService.editListTitle(list.id, data.listName)
                .then(() => {
                  this.presentToast('List ' + list.title + ' Updated');
                });
            } else {
              this.listManagementService.createList(data.listName)
                .then(() => {
                  this.presentToast('List ' + data.listName + ' Created');
                });
            }
          },
        },
      ],
    });
    await alert.present();
  }

  /**
   * Alert to confirm a list deletion
   * @param list 
   */
  async confirmListDeletionAlert(list: any) {
    const alert = await this.alertController.create({
      header: 'Confirm',
      message: 'Are you sure you want to delete the list ' + list.title + '?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary'
        }, {
          text: 'Confirm',
          handler: () => {
            this.listManagementService.deleteList(list.id)
              .then(() => {
                this.presentToast('List ' + list.title + ' Deleted');
              });
          }
        }
      ]
    });

    await alert.present();
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
   * Code based on tut https://www.youtube.com/watch?v=w5PR_d6eiQI
   * @param index 
   */
  toggleList(index) {
    this.userLists[index].open = !this.userLists[index].open;

    // close all subLists that are open if this list is closed
    if (!this.userLists[index].open) {
      this.userLists.filter((userListIndex) => userListIndex != index)
        .map(userList => {
          userList.subLists.map(subList => {
            subList.open = false;
            subList.tasks.map(task => task.expanded = false);
          });
        });
    } else {
      this.userLists.filter((userList, userListIndex) => userListIndex != index)
      .map(userList => 
        userList.open = false
      );
    }


  }

  /**
   * Code based on tut https://www.youtube.com/watch?v=w5PR_d6eiQI
   * @param index 
   * @param subIndex 
   */
  toggleSubList(index, subIndex) {
    this.userLists[index].subLists[subIndex].open = !this.userLists[index].subLists[subIndex].open;
    console.log("Task title ", this.userLists[index].subLists[0].tasks[0]);


    if (this.userLists[index].open) {
      this.userLists.map(userList => {
        userList.subLists.filter((subList, subListIndex) => subListIndex != subIndex)
          .map(subList => {
            subList.open = false;
            subList.tasks.map(task => task.expanded = false);
          });
      });
    }

  }

  /**
   * Expands a task card to show more details
   * @param task 
   */
  expandCard(task): void {
    if (task.expanded) {
      task.expanded = false;
    } else {
      this.userLists.map(userList => {
        userList.subLists.map(subList => {
          subList.tasks.map(subListTasks => {
            if (subListTasks == task) {
              subListTasks.expanded = !subListTasks.expanded;
            } else {
              subListTasks.expanded = false;
            }
          });
        });
      });
    }
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
   * Deletes a subtask from the task's list of subtasks
   * @param index 
   */
  async deleteSubTask(index: number, task:any) {
    task.subTasks.splice(index, 1);
    return this.taskManagementService.editTask(task, task.id).then(() => {
      this.presentToast('Sub-task of ' + task.title + ' successfully deleted');
    }).catch(error => {
      console.log("error deleting subtask", error);
    });
  }

  async updateSubtasks(task:any) {
    return this.taskManagementService.editTask(task, task.id);
  }
}
