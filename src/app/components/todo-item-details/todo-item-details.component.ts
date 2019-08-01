import { Component, OnInit } from '@angular/core';
import { ListManagementService } from 'src/app/services/todo/list-management.service';
@Component({
  selector: 'app-todo-item-details',
  templateUrl: './todo-item-details.component.html',
  styleUrls: ['./todo-item-details.component.scss'],
})
export class TodoItemDetailsComponent implements OnInit {
  public listTitleList: Array<any>;
  public startDate: string;
  public endDate: string;
  constructor(private listManagementService: ListManagementService) { }

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
}
