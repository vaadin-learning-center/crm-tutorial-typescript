import { makeAutoObservable } from 'mobx';
import { AuthStore } from './auth-store';
import { EntityStore } from './entity-store';

export class RootStore {
  auth: AuthStore;
  entities: EntityStore;

  constructor() {
    makeAutoObservable(this);
    this.auth = new AuthStore();
    this.entities = new EntityStore(this);
  }
}

export const rootStore = new RootStore();