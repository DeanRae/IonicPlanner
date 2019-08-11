import { Component, OnInit } from '@angular/core';
import { ListManagementService } from 'src/app/services/todo/list-management.service';
import { TaskManagementService } from 'src/app/services/todo/task-management.service';

@Component({
  selector: 'app-task-lists',
  templateUrl: './task-lists.page.html',
  styleUrls: ['./task-lists.page.scss'],
})
export class TaskListsPage implements OnInit {
  public userLists: any;

  constructor(private listManagementService: ListManagementService, private taskManagementService: TaskManagementService) {
    this.listManagementService
      .getUserLists()
      .get()
      .then(userListSnapshot => {
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
          if (this.listManagementService.checkCollectionExistence(snap.id, "uncompleted_tasks")) {
            // push all docs under this to list.subLists[0].tasks
            this.listManagementService
              .getUserLists()
              .doc(snap.id)
              .collection("uncompleted_tasks")
              .get()
              .then(subListSnapshot => {
                subListSnapshot.forEach(subSnap => {
                  this.taskManagementService.getTaskObject(subSnap.id).then(task => {
                    list.subLists[0].tasks.push({
                      details: task,
                      expanded: false
                    });
                  }).catch(error => {
                    console.log("Error: ", error);
                  });
                });
              });
          }

          if (this.listManagementService.checkCollectionExistence(snap.id, "completed_tasks")) {
            this.listManagementService
              .getUserLists()
              .doc(snap.id)
              .collection("completed_tasks")
              .get()
              .then(subListSnapshot => {
                subListSnapshot.forEach(subSnap => {
                  let task = this.taskManagementService.getTask(subSnap.id);
                  list.subLists[1].tasks.push({
                    details: task,
                    expanded: false
                  });
                });
              });
          }

          this.userLists.push(list);
        });
      });

  }

  ngOnInit() {

  }

  /**
   * Code based on tut https://www.youtube.com/watch?v=w5PR_d6eiQI
   * @param index 
   */
  toggleList(index) {
    this.userLists[index].open = !this.userLists[index].open;
    // console.log("User list: " + this.userLists[index].open)
    // console.log("Userlist " ,this.userLists);
    // console.log("Sub list ", this.userLists[index].subLists);
    // console.log("Sublist title ", this.userLists[index].subLists[0].title);

    // close all subLists that are open if this list is closed
    if (!this.userLists[index].open) {
      this.userLists.filter((userListIndex) => userListIndex != index)
      .map(userList => {
        userList.subLists.map(subList => subList.open = false);
      });
    }


  }

  /**
   * Code based on tut https://www.youtube.com/watch?v=w5PR_d6eiQI
   * @param index 
   * @param subIndex 
   */
  toggleSubList(index, subIndex) {
    this.userLists[index].subLists[subIndex].open = !this.userLists[index].subLists[subIndex].open;
    // console.log("Task title ", this.userLists[index].subLists[0].tasks[0]);

    
    if (this.userLists[index].open) {
      this.userLists.map(userList => {
        userList.subLists.filter((subList, subListIndex) => subListIndex != subIndex)
          .map(subList => subList.open = false);
      });
    }
    
  }

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

}
