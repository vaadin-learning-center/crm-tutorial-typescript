import { autorun, makeAutoObservable, runInAction, when } from 'mobx';
import { RootStore } from './index';

import {
  find,
  saveContact,
  deleteContact,
  getContactStatuses,
  findAllCompanies
} from '../generated/ServiceEndpoint';
import Company from '../generated/com/vaadin/tutorial/crm/backend/entity/Company';
import Contact from '../generated/com/vaadin/tutorial/crm/backend/entity/Contact';
import ContactModel from '../generated/com/vaadin/tutorial/crm/backend/entity/ContactModel';
import Status from '../generated/com/vaadin/tutorial/crm/backend/entity/Contact/Status';

export class ContactListStore {
  root: RootStore;
  contacts: Contact[] = [];
  selectedContactId?: Contact['id'] = undefined;
  filter: string = '';

  companies: Company[] = [];
  statuses: Status[] = [];

  constructor(root: RootStore) {
    makeAutoObservable(this);
    this.root = root;

    autorun(() => this.updateContacts());
    when(() => this.root.auth.isLoggedIn, async () => {
      const [companies, statuses] =
        await Promise.all([findAllCompanies(), getContactStatuses()]);
      runInAction(() => {
        this.companies = companies;
        this.statuses = statuses;
      });
    });
  }

  get selectedContact() {
    return this.selectedContactId === 0
        ? ContactModel.createEmptyValue()
        : this.contacts.find(c => c.id === this.selectedContactId);
  }

  private async updateContacts() {
    const contacts = this.root.auth.isLoggedIn ? await find(this.filter) : [];
    runInAction(() => this.contacts = contacts);
  }

  addNewContact() {
    this.selectedContactId = 0;
  }

  async saveContact(contact: Contact) {
    // optimistic UI update
    this.clearSelection();
    const idx = this.contacts.findIndex(c => c.id === contact.id);
    if (idx > -1) {
      this.contacts[idx] = contact;
    } else {
      this.contacts.push(contact);
    }
    // force an update to the bound grid
    // (it does not happen automatically since the `contacts` property is updated in place)
    this.contacts = [...this.contacts];

    // update the backend and re-sync the UI
    await saveContact(contact);
    await this.updateContacts();
  }

  async deleteContact(contact: Contact) {
    // optimistic UI update
    this.clearSelection();
    const idx = this.contacts.findIndex(c => c.id === contact.id);
    if (idx > -1) {
      this.contacts.splice(idx, 1);

      // force an update to the bound grid
      // (it does not happen automatically since the `contacts` property is updated in place)
      this.contacts = [...this.contacts];
    }

    // update the backend and re-sync the UI
    await deleteContact(contact);
    await this.updateContacts();
  }

  setFilter(filter: string) {
    this.filter = filter;
  }

  setSelectedContact(contact?: Contact) {
    this.selectedContactId = contact?.id;
  }

  clearSelection() {
    this.selectedContactId = undefined;
  }
}
