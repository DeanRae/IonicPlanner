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

  createList(listTitle:string): Promise<firebase.firestore.DocumentReference> {
    // create the list that user defined (created as a document in firestore)
    return this.userListsRef.add({
      title: listTitle,
    })
  }

  editListTitle(listId:string, newListTitle:string){
    this.userListsRef.doc(listId).update({
      title: newListTitle
    })
  }

  deleteList() {
    
  }

  getUserLists(): firebase.firestore.CollectionReference {
    return this.userListsRef;
  }
}
