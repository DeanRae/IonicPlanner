import { Injectable } from '@angular/core';
import * as firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import { isNullOrUndefined } from 'util';

@Injectable({
  providedIn: 'root'
})
export class ListManagementService {
  public userListsRef: firebase.firestore.CollectionReference;
  currentUser: firebase.User;
  userProfile: firebase.firestore.DocumentReference;

  constructor() {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        this.userListsRef = firebase
          .firestore()
          .collection(`/userProfile/${user.uid}/user_lists`);
      }
    });

    // just in case code above does not save the reference
    if (isNullOrUndefined(this.userListsRef)) {
      this.currentUser = firebase.auth().currentUser;
      this.userProfile = firebase.firestore().doc(`/userProfile/${this.currentUser.uid}`);

      this.userListsRef = firebase
        .firestore()
        .collection(`/userProfile/${this.currentUser.uid}/user_lists`);
    }
  }

  /**
   * Creates a new list 
   * @param listTitle 
   */
  public async createList(listTitle: string): Promise<any> {
    // create the list that user defined (created as a document in firestore)
    try {
      return this.userListsRef.add({
        title: listTitle,
      });
    }
    catch (error) {
      console.error("Error adding document: ", error);
    }
  }

  /**
   * Updates the list's title
   * @param listId 
   * @param newListTitle 
   */
  public async editListTitle(listId: string, newListTitle: string): Promise<any> {
    try {
      return this.userListsRef.doc(listId).update({
        title: newListTitle
      });
    }
    catch (error) {
      console.error("Error editing document: ", error);
    }
  }

  /**
   * Deletes the list document
   * @param listId 
   */
  public async deleteList(listId: string) {
    try {
      await this.userListsRef.doc(listId).delete();
      console.log("Document successfully deleted!");
    }
    catch (error) {
      console.error("Error removing document: ", error);
    }
  }

  /**
   * Returns a reference to the collection that stores all the user's lists
   * of tasks
   */
  getUserLists(): firebase.firestore.CollectionReference {
    return this.userListsRef;
  }

  /**
   * Returns document reference to the default task list
   */
  getUserAllTasksList(): firebase.firestore.DocumentReference {
    return this.userListsRef.doc("all_tasks");
  }
}
