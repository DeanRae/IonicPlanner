import { Injectable } from '@angular/core';
import * as firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import { isNullOrUndefined } from 'util';
@Injectable({
  providedIn: 'root'
})
export class TaskManagementService {

  public userListsRef: firebase.firestore.CollectionReference;
  public userAllTasksListRef: firebase.firestore.CollectionReference;
  private currentUser: firebase.User;
  private userProfile: firebase.firestore.DocumentReference;

  constructor() {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        this.userListsRef = firebase
          .firestore()
          .collection(`/userProfile/${user.uid}/user_lists`);
        this.userAllTasksListRef = firebase
          .firestore().collection(`/userProfile/${user.uid}/user_lists/all_tasks/tasks`);
      }
    });

    // just in case code above does not save the reference
    if (isNullOrUndefined(this.userListsRef)) {
      this.currentUser = firebase.auth().currentUser;
      this.userProfile = firebase.firestore().doc(`/userProfile/${this.currentUser.uid}`);

      this.userListsRef = firebase
        .firestore()
        .collection(`/userProfile/${this.currentUser.uid}/user_lists`);
      this.userAllTasksListRef = firebase
        .firestore().collection(`/userProfile/${this.currentUser.uid}/user_lists/all_tasks/tasks`);
    }
  }

  addTask(
    listId: string,
    taskName: string,
    taskStartDate: string,
    taskEndDate: string,
    taskStartTime: string,
    taskEndTime: string,
    taskLocation: string,
    taskDescription: string): any {

    if (isNullOrUndefined(listId)) {
      // since user didnt specify which list they wanted the task added to,
      // just store task in default list: All Tasks
      return this.userAllTasksListRef
        .add({
          name: taskName,
          listId: listId,
          location: taskLocation,
          startDate: taskStartDate,
          startTime: taskStartTime,
          endDate: taskEndDate,
          endTime: taskEndTime,
          description: taskDescription
        }).then(function (docRef) {
          console.log("Document written with ID: ", docRef.id, " to default list All Tasks");
        })
        .catch(function (error) {
          console.error("Error adding document: ", error);
        });
    } else {
      // first add new document to user's inputted list. 
      let newTaskRef: firebase.firestore.DocumentReference = this.userListsRef.doc(listId).collection("tasks").doc();

      console.log("new document with id ", newTaskRef.id, " was created under user defined list ", listId);

      return this.userAllTasksListRef
        .doc(newTaskRef.id)
        .set({
          name: taskName,
          listId: listId,
          location: taskLocation,
          startDate: taskStartDate,
          startTime: taskStartTime,
          endDate: taskEndDate,
          endTime: taskEndTime,
          description: taskDescription
        }).then(function (docRef) {
          console.log("Document written with ID: ", newTaskRef.id, " to default list: all tasks");
        })
        .catch(function (error) {
          console.error("Error adding document: ", error);
        });
    }
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

    // first check to see if there are any changes to the assigned list
    let previousListId: string;

    this.userAllTasksListRef.doc(taskId).get().then(doc => previousListId = doc.data().listId)

    // if there are changes, delete task reference in previous list and add to new list
    if ((listId == previousListId) && listId != "all_tasks") {
      this.userListsRef.doc(previousListId).collection("tasks").doc(taskId).delete();
      this.userListsRef.doc(listId).collection("tasks").doc(taskId);
    }
    this.userAllTasksListRef
      .doc(taskId)
      .update({
        name: taskName,
        list: listId,
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

  getTask(taskId: string): firebase.firestore.DocumentReference {
    return this.userListsRef
      .doc("all_tasks")
      .collection("tasks")
      .doc(taskId)
  }

  deleteTask(taskId: string, listId: string) {
    // deletes from user defined list
    this.userListsRef
      .doc(listId)
      .collection("tasks")
      .doc(taskId)
      .delete()
      .catch(function (error) {
        console.error("Error removing document: ", error);
      });

    // delete from default list that stores all tasks
    this.userAllTasksListRef
      .doc(taskId)
      .delete()
      .catch(function (error) {
        console.error("Error removing document: ", error);
      });
  }

}
