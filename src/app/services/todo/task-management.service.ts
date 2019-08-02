import { Injectable } from '@angular/core';
import * as firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
@Injectable({
  providedIn: 'root'
})
export class TaskManagementService {
  public userListsRef: firebase.firestore.CollectionReference;

  constructor() {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        this.userListsRef = firebase
          .firestore()
          .collection(`/userProfile/${user.uid}/user_lists`);
      }
    });
  }

  addTask(
    listId: string,
    taskName: string,
    taskStartDate: string,
    taskEndDate: string,
    taskStartTime: string,
    taskEndTime: string,
    taskLocation: string,
    taskDescription: string): Promise<firebase.firestore.DocumentReference> {
    return this.userListsRef
      .doc(listId)
      .collection('tasks')
      .add({
        name: taskName,
        location: taskLocation,
        startDate: taskStartDate,
        startTime: taskStartTime,
        endDate: taskEndDate,
        endTime: taskEndTime,
        description: taskDescription
      })
  }

  editTask(
    taskId: string,
    listId: string,
    taskName: string,
    taskStartDate: string,
    taskEndDate: string,
    taskStartTime: string,
    taskEndTime: string,
    taskLocation: string,
    taskDescription: string) {
    this.userListsRef
      .doc(listId)
      .collection('tasks')
      .doc(taskId)
      .update({
        name: taskName,
        location: taskLocation,
        startDate: taskStartDate,
        startTime: taskStartTime,
        endDate: taskEndDate,
        endTime: taskEndTime,
        description: taskDescription
      })
      .catch(function (error) {
        console.error("Error updating document: ", error);
      });
  }

  deleteTask(taskId: string, listId: string) {
    this.userListsRef
      .doc(listId)
      .collection('tasks')
      .doc(taskId)
      .delete()
      .catch(function (error) {
        console.error("Error removing document: ", error);
      });
  }

}
