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
  private userProfile: firebase.firestore.DocumentReference;

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
      this.userProfile = firebase.firestore().doc(`/userProfile/${this.currentUser.uid}`);

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
  public async createTask(task: Task) {
    let newTaskRef: firebase.firestore.DocumentReference = this.userAllTasksListRef.collection("tasks").doc();

    // store id in relevant completed or uncompleted list
    this.storeTaskStatus(task, newTaskRef.id);

    // add to default list
    try {
      const docRef = await this.userAllTasksListRef.collection("tasks").doc(newTaskRef.id)
        .set({
          title: task.title,
          listId: task.listId,
          location: task.location,
          startTime: task.startTime,
          endTime: task.endTime,
          allDay: task.allDay,
          isCompleted: task.isCompleted,
          description: task.description,
          subTasks: task.subTasks,
          createdTimestamp: firebase.firestore.FieldValue.serverTimestamp(),
          id: newTaskRef.id
        });
      console.log("Document written with ID: ", newTaskRef.id, " to default list All Tasks");
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
  private setTaskComplete(task: Task, taskId: string) {
    // delete task from uncompleted tasks if it exists
    this.removeTaskFromUncompleted(this.userAllTasksListRef.id, taskId);

    this.userAllTasksListRef.collection("completed_tasks").doc(taskId).set({
      id: taskId
    });

    // do the same for user defined lists (if any)
    if (task.listId != '') {
      // delete task from uncompleted tasks if it exists
      this.removeTaskFromUncompleted(task.listId, taskId);

      this.userListsRef.doc(task.listId).collection("completed_tasks").doc(taskId).set({
        id: taskId
      });
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
    if (this.isTaskUncompleted(listId, taskId)) {
      this.userListsRef.doc(listId).collection("uncompleted_tasks")
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
    if (this.isTaskCompleted(listId, taskId)) {
      this.userListsRef.doc(listId).collection("completed_tasks")
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
  private setTaskUncomplete(task: Task, taskId: string) {
    // delete task from completed tasks if it exists
    this.removeTaskFromCompleted(this.userAllTasksListRef.id, taskId);

    this.userAllTasksListRef.collection("uncompleted_tasks").doc(taskId).set({
      id: taskId
    });

    // do the same for user defined lists (if any)
    if (task.listId != '') {
      // delete task from uncompleted tasks if it exists
      this.removeTaskFromCompleted(task.listId, taskId);

      this.userListsRef.doc(task.listId).collection("uncompleted_tasks").doc(taskId).set({
        id: taskId
      });
    }
  }

  /**
   * Checks if the task is present in a given list's "completed_tasks"
   * collection. 
   * @param listId 
   * @param taskId 
   * @returns true if present in given list's "completed_tasks"
   */
  private isTaskCompleted(listId: string, taskId: string): boolean {
    let isCompleted = false;
    this.userListsRef.doc(listId).collection("completed_tasks").where("id", "==", taskId)
      .get()
      .then(result => {
        if (result.empty) {
          isCompleted = false;
        } else {
          isCompleted = true;
        }
      });

    return isCompleted;
  }

  /**
   * Checks if the task is present in a given list's "uncompleted_tasks"
   * collection. 
   * @param listId 
   * @param taskId 
   * @returns true if present in given list's "uncompleted_tasks"
   */
  private isTaskUncompleted(listId: string, taskId: string): boolean {
    let isUncompleted = false;
    this.userListsRef.doc(listId).collection("uncompleted_tasks").where("id", "==", taskId)
      .get()
      .then(result => {
        if (result.empty) {
          isUncompleted = false;
        } else {
          isUncompleted = true;
        }
      });

    return isUncompleted;
  }

  /**
   * Edit
   * @param task 
   * @param taskId 
   */
  public async editTask(task: Task, taskId: string) {
    // edit the tasks completed/uncompleted status in relevant lists
    this.editTaskStatus(task, taskId);
    // add all task changes to default list
    try {
      return this.userAllTasksListRef
        .collection("all_tasks")
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
  private editTaskStatus(task: Task, taskId: string) {
    // first check to see if there are any changes to the assigned list
    let previousListId: string;

    this.userAllTasksListRef.collection("tasks").doc(taskId).get().then(doc => previousListId = doc.data().listId);

    // if there are changes to task status (complete or uncomplete):
    if ((task.listId == previousListId) && task.listId != '') {
      // switch if taskList is still the same
      if (task.isCompleted && this.isTaskUncompleted(previousListId, taskId)) {
        this.setTaskComplete(task, taskId);
      } else if (!task.isCompleted && this.isTaskCompleted(previousListId, taskId)) {
        this.setTaskUncomplete(task, taskId);
      }
    } else if ((task.listId != previousListId)) {
      // remove from previous list if not the same and move to new list
      if (previousListId != '') {
        if (this.isTaskCompleted(previousListId, taskId)) {
          this.removeTaskFromCompleted(previousListId, taskId);
        } else {
          this.removeTaskFromUncompleted(previousListId, taskId);
        }
      }

      if (task.listId != '') {
        if (task.isCompleted) {
          this.userListsRef.doc(task.listId).collection("completed_tasks").doc(taskId).set({
            id: taskId
          });
        } else {
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
  public async deleteTask(taskId: string, listId: string) {
    // deletes from completed/uncompleted lists
    let task;
    this.userAllTasksListRef.collection("all_tasks").doc(taskId).get().then(doc => task = doc.data());

    if (task.isCompleted) {
      this.removeTaskFromCompleted(task.listId, taskId);
      this.removeTaskFromCompleted(this.userAllTasksListRef.id, taskId);
    } else {
      this.removeTaskFromUncompleted(task.listId, taskId);
      this.removeTaskFromUncompleted(this.userAllTasksListRef.id, taskId);
    }

    // delete from default list that stores all tasks
    try {
      return this.userAllTasksListRef
        .collection("all_tasks")
        .doc(taskId)
        .delete();
    }
    catch (error) {
      console.error("Error removing document: ", error);
    }
  }

}
