import { makeAutoObservable, runInAction, when } from 'mobx';
import type { RootStore } from './index';

import {
  deleteContact,
  find,
  findAllCompanies,
  getContactStatuses,
  saveContact
} from '../generated/ServiceEndpoint';
import Contact from '../generated/com/vaadin/tutorial/crm/backend/entity/Contact';
import Company from '../generated/com/vaadin/tutorial/crm/backend/entity/Company';
import Status from '../generated/com/vaadin/tutorial/crm/backend/entity/Contact/Status';

export class EntityStore {
  root: RootStore;
  contacts: Contact[] = [];
  companies: Company[] = [];
  statuses: Status[] = [];

  constructor(root: RootStore) {
    makeAutoObservable(this);
    this.root = root;

    when(() => this.root.auth.isLoggedIn, async () => {
      this.updateContacts();
      const [companies, statuses] =
        await Promise.all([findAllCompanies(), getContactStatuses()]);
      runInAction(() => {
        this.companies = companies;
        this.statuses = statuses;
      });
    });
  }

  private async updateContacts() {
    const contacts = await find('');
    runInAction(() => this.contacts = contacts);
  }

  async saveContact(contact: Contact) {
    // optimistic UI update
    const idx = this.contacts.findIndex(c => c.id === contact.id);
    if (idx > -1) {
      this.contacts[idx] = contact;
    } else {
      this.contacts.push(contact);
    }

    // update the backend and re-sync the UI
    await saveContact(contact);
    await this.updateContacts();
  }

  async deleteContact(contact: Contact) {
    // optimistic UI update
    const idx = this.contacts.findIndex(c => c.id === contact.id);
    if (idx > -1) {
      this.contacts.splice(idx, 1);
    }

    // update the backend and re-sync the UI
    await deleteContact(contact);
    await this.updateContacts();
  }
}
