import { Injectable } from '@angular/core';
import * as firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import { isNullOrUndefined } from 'util';
import { Task } from 'src/app/interfaces/task';
@Injectable({
  providedIn: 'root'
})
export class TaskManagementService {

  public userListsRef: firebase.firestore.CollectionReference;
  public userAllTasksListRef: firebase.firestore.DocumentReference;
  private currentUser: firebase.User;

  constructor() {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        this.userListsRef = firebase
          .firestore()
          .collection(`/userProfile/${user.uid}/user_lists`);
        this.userAllTasksListRef = firebase
          .firestore().collection(`/userProfile/${user.uid}/user_lists/`).doc('all_tasks');
      }
    });

    // just in case code above does not save the reference
    if (isNullOrUndefined(this.userListsRef)) {
      this.currentUser = firebase.auth().currentUser;

      this.userListsRef = firebase
        .firestore()
        .collection(`/userProfile/${this.currentUser.uid}/user_lists`);
      this.userAllTasksListRef = firebase
        .firestore().collection(`/userProfile/${this.currentUser.uid}/user_lists/`).doc('all_tasks');
    }
  }

  /**
   * Creates a new task 
   * @param task 
   */
  public async  createTask(task: Task) {
    let newTaskRef: firebase.firestore.DocumentReference = this.userAllTasksListRef.collection("tasks").doc();

    // store id in relevant completed or uncompleted list
    this.storeTaskStatus(task, newTaskRef.id);

    try {
      const data = await this.userAllTasksListRef.collection("tasks").doc(newTaskRef.id).set({
        title: task.title,
        listId: task.listId,
        location: task.location,
        startTime: task.startTime,
        endTime: task.endTime,
        allDay: task.allDay,
        isCompleted: task.isCompleted,
        description: task.description,
        subTasks: task.subTasks,
        completionRate: task.completionRate,
        createdTimestamp: firebase.firestore.FieldValue.serverTimestamp(),
      });
      console.log("Created task with ID: ", newTaskRef.id, " to default list All Tasks");
    }
    catch (error) {
      console.error("Error adding document: ", error);
    }

  }


  /**
   * Stores the task in the relevant complete/uncomplete collections of 
   * both the default list (all_tasks) and a user defined list given 
   * by task.listId
   * @param task 
   * @param taskId 
   */
  private storeTaskStatus(task: Task, taskId: string) {
    // store in correct collection in default all_tasks list and user defined list (if any)
    if (task.isCompleted) {
      this.setTaskComplete(task, taskId);
    } else {
      this.setTaskUncomplete(task, taskId);
    }
  }

  /**
   * Stores the task in the "completed_tasks" collection and removes
   * it from "uncompleted_tasks" if present of both the 
   * default list (all_tasks) and a user defined list given by task.listId
   * @param task 
   * @param taskId 
   */
  public async setTaskComplete(task: Task, taskId: string) {
    // delete task from uncompleted tasks if it exists
    try {
      await this.removeTaskFromUncompleted(this.userAllTasksListRef.id, taskId);
      // add it to default list's completed collection
      this.userAllTasksListRef.collection("completed_tasks").doc(taskId).set({
        id: taskId
      })
        .then(() => {
          // do the same for user defined lists (if any)
          if (task.listId) {
            // delete task from uncompleted tasks if it exists
            this.removeTaskFromUncompleted(task.listId, taskId).then(() => {
              // add it to user defined list's completed collection
              this.userListsRef.doc(task.listId).collection("completed_tasks").doc(taskId).set({
                id: taskId
              });
            });
          }
        });
      // set task info to be completed
      this.getTask(taskId).update({ isCompleted: true });
    }
    catch (error) {
      console.log("Error setting task as complete ", error);
    }
  }
  /**
   * Used as a helper method in setTaskComplete.
   * Can also be used as a standalone and removes the task from
   * the given list's "uncompleted_tasks" collection
   * @param listId 
   * @param taskId 
   */
  private removeTaskFromUncompleted(listId: string, taskId: string) {
    if (listId && this.isTaskUncompleted(listId, taskId)) {
      return this.userListsRef.doc(listId).collection("uncompleted_tasks")
        .doc(taskId)
        .delete();
    }
  }

  /**
   * Used as a helper method in setTaskUncomplete.
   * Can also be used as a standalone and removes the task from
   * the given list's "completed_tasks" collection
   * @param listId 
   * @param taskId 
   */
  private removeTaskFromCompleted(listId: string, taskId: string) {
    if (listId && this.isTaskCompleted(listId, taskId)) {
      return this.userListsRef.doc(listId).collection("completed_tasks")
        .doc(taskId)
        .delete();
    }
  }

  /**
   * Stores the task in the "uncompleted_tasks" collection and removes
   * it from "completed_tasks" if present of both the 
   * default list (all_tasks) and a user defined list given by task.listId
   * @param task 
   * @param taskId 
   */
  public async setTaskUncomplete(task: Task, taskId: string) {
     // delete task from uncompleted tasks if it exists
     try {
      await this.removeTaskFromCompleted(this.userAllTasksListRef.id, taskId);
      // add it to default list's completed collection
      this.userAllTasksListRef.collection("uncompleted_tasks").doc(taskId).set({
        id: taskId
      })
        .then(() => {
          // do the same for user defined lists (if any)
          if (task.listId) {
            // delete task from uncompleted tasks if it exists
            this.removeTaskFromCompleted(task.listId, taskId).then(() => {
              // add it to user defined list's completed collection
              this.userListsRef.doc(task.listId).collection("uncompleted_tasks").doc(taskId).set({
                id: taskId
              });
            });
          }
        });
      // set task info to be completed
      this.getTask(taskId).update({ isCompleted: false });
    }
    catch (error) {
      console.log("Error setting task as uncomplete ", error);
    }
  }

  /**
   * Checks if the task is present in a given list's "completed_tasks"
   * collection. 
   * @param listId 
   * @param taskId 
   * @returns true if present in given list's "completed_tasks"
   */
  private async isTaskCompleted(listId: string, taskId: string) {
    try {
      const result = await this.userListsRef.doc(listId).collection("completed_tasks").where("id", "==", taskId)
        .get();
      if (result.empty) {
        return false;
      }
      else {
        return true;
      }
    }
    catch (e) {
      console.log("Error checking if userList ", listId, " has completed task of id ", taskId)
      return false;
    }
  }

  /**
   * Checks if the task is present in a given list's "uncompleted_tasks"
   * collection. 
   * @param listId 
   * @param taskId 
   * @returns true if present in given list's "uncompleted_tasks"
   */
  private async isTaskUncompleted(listId: string, taskId: string) {
    try {
      const result = await this.userListsRef.doc(listId).collection("uncompleted_tasks").where("id", "==", taskId)
        .get();
      if (result.empty) {
        return false;
      }
      else {
        return true;
      }
    }
    catch (e) {
      console.log("Error checking if userList ", listId, " has uncompleted task of id ", taskId)
      return false;
    }
  }

  /**
   * Edit
   * @param task 
   * @param taskId 
   */
  public async editTask(task: Task, taskId: string) {
    // edit the tasks completed/uncompleted status in relevant lists
    await this.editTaskStatus(task, taskId);
    try {
      return this.userAllTasksListRef
        .collection("tasks")
        .doc(taskId)
        .update({
          title: task.title,
          listId: task.listId,
          location: task.location,
          startTime: task.startTime,
          endTime: task.endTime,
          allDay: task.allDay,
          isCompleted: task.isCompleted,
          description: task.description,
          subTasks: task.subTasks,
          completionRate: task.completionRate,
          updatedTimestamp: firebase.firestore.FieldValue.serverTimestamp(),
        });
    }
    catch (error) {
      console.error("Error updating document: ", error);
    }
  }

  /**
   * Used as a helper method for editTask and changes the 
   * task's completed/uncompleted status in the relevant lists.
   * @param task 
   * @param taskId 
   */
  private async editTaskStatus(task: Task, taskId: string) {
    // first check to see if there are any changes to the assigned list

    const doc = await this.userAllTasksListRef
      .collection("tasks")
      .doc(taskId)
      .get();
    let previousListId = doc.data().listId;
    // if there are changes to task status (complete or uncomplete):
    if ((task.listId == previousListId) && task.listId && previousListId) {
      // switch if taskList is still the same
      if (task.isCompleted && this.isTaskUncompleted(previousListId, taskId)) {
        this.setTaskComplete(task, taskId);
      }
      else if (!task.isCompleted && this.isTaskCompleted(previousListId, taskId)) {
        this.setTaskUncomplete(task, taskId);
      }
    }
    else if ((task.listId != previousListId)) {
      // remove from previous list if not the same and move to new list
      if (previousListId) {
        if (this.isTaskCompleted(previousListId, taskId)) {
          this.removeTaskFromCompleted(previousListId, taskId);
        }
        else {
          this.removeTaskFromUncompleted(previousListId, taskId);
        }
      }
      if (task.listId) {
        if (task.isCompleted) {
          this.userListsRef.doc(task.listId).collection("completed_tasks").doc(taskId).set({
            id: taskId
          });
        }
        else {
          this.userListsRef.doc(task.listId).collection("uncompleted_tasks").doc(taskId).set({
            id: taskId
          });
        }
      }
    }
  }

  /**
   * Returns a reference to a task given the taskId
   * @param taskId 
   */
  public getTask(taskId: string): firebase.firestore.DocumentReference {
    return this.userAllTasksListRef
      .collection("tasks")
      .doc(taskId);
  }

  /**
   * Deletes the task from all relevant lists/collections
   * @param taskId 
   * @param listId 
   */
  public async deleteTask(taskId: string) {
    // deletes from completed/uncompleted lists

    const doc = await this.userAllTasksListRef
      .collection("tasks")
      .doc(taskId)
      .get();
    let task = doc.data();
    if (task.isCompleted) {
      this.removeTaskFromCompleted(task.listId, taskId);
      this.removeTaskFromCompleted(this.userAllTasksListRef.id, taskId);
    }
    else {
      this.removeTaskFromUncompleted(task.listId, taskId);
      this.removeTaskFromUncompleted(this.userAllTasksListRef.id, taskId);
    }
    // delete from default list that stores all tasks
    try {
      return this.userAllTasksListRef
        .collection("tasks")
        .doc(taskId)
        .delete();
    }
    catch (error) {
      console.error("Error removing document: ", error);
    }


  }

}
