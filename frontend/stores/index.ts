import { makeAutoObservable } from 'mobx';
import { AuthStore } from './auth-store';
import { ContactListStore } from './list-store';

export class RootStore {
  auth: AuthStore;
  contactList: ContactListStore;

  constructor() {
    makeAutoObservable(this);
    this.auth = new AuthStore();
    this.contactList = new ContactListStore(this);
  }
}

export const rootStore = new RootStore();