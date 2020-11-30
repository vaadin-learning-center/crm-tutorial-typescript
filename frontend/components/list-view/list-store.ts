import { makeAutoObservable } from 'mobx';
import type { RootStore } from '../../stores';

import Contact from '../../generated/com/vaadin/tutorial/crm/backend/entity/Contact';
import ContactModel from '../../generated/com/vaadin/tutorial/crm/backend/entity/ContactModel';

export class ContactListStore {
  root: RootStore;
  selectedContactId?: Contact['id'] = undefined;
  filter: string = '';

  constructor(root: RootStore) {
    makeAutoObservable(this);
    this.root = root;
  }

  get filteredContacts() {
    const filter = this.filter.toLowerCase();
    return this.root.entities.contacts.filter(c =>
      c.firstName.toLowerCase().includes(filter)
      || c.lastName.toLowerCase().includes(filter));
  }

  get selectedContact() {
    return this.selectedContactId === 0
        ? ContactModel.createEmptyValue()
        : this.root.entities.contacts.find(c => c.id === this.selectedContactId);
  }

  addNewContact() {
    this.selectedContactId = 0;
  }

  async saveContact(contact: Contact) {
    this.clearSelection();
    await this.root.entities.saveContact(contact);
  }

  async deleteContact(contact: Contact) {
    this.clearSelection();
    await this.root.entities.deleteContact(contact);
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
