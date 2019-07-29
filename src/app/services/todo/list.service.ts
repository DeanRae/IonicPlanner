import { Injectable } from '@angular/core';
import { ProfileService } from '../user/profile.service';
import 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class ListService {
  public userLists: firebase.firestore.CollectionReference;

  constructor(private profileService: ProfileService) {
    this.userLists = this.profileService.userProfile.collection('user_lists');
    
  }

  addList(){

  }

  editListName(){

  }

  deleteList() {

  }
}
