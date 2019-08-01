import { Injectable } from '@angular/core';
import * as firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class ListManagementService {
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
}
