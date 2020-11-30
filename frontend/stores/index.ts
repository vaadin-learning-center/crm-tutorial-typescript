import { makeAutoObservable } from 'mobx';
import { AuthStore } from './auth-store';
import { EntityStore } from './entity-store';
import { ContactListStore } from './list-store';
import { DashboardStore } from './dashboard-store';

export class RootStore {
  auth: AuthStore;
  entities: EntityStore;
  contactList: ContactListStore;
  dashboard: DashboardStore;

  constructor() {
    makeAutoObservable(this);
    this.auth = new AuthStore();
    this.entities = new EntityStore(this);
    this.contactList = new ContactListStore(this);
    this.dashboard = new DashboardStore(this);
  }
}

export const rootStore = new RootStore();