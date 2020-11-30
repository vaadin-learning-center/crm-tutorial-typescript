import { makeAutoObservable } from 'mobx';
import type { RootStore } from '../../stores';

export class DashboardStore {
  root: RootStore;

  constructor(root: RootStore) {
    makeAutoObservable(this);
    this.root = root;
  }

  get contactCount() {
    return this.root.entities.contacts.length;
  }

  get contactCountByCompanyName() {
    return Object.entries(
      this.root.entities.contacts
        .map(contact => contact.company?.name || 'no company')
        .reduce((counts, companyName) => {
          counts[companyName] = (counts[companyName] || 0) + 1;
          return counts;
        }, {} as { [k in string]: number }));
  }
}