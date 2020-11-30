import { makeAutoObservable, runInAction, when } from 'mobx';
import type { RootStore } from './index';

import {
  deleteContact,
  find,
  getContactStatuses,
  saveContact
} from '../generated/ServiceEndpoint';
import {
  deleteCompany,
  findAllCompanies,
  getCompanyStates,
  saveCompany,
} from '../generated/CompanyEndpoint';
import Company from '../generated/com/vaadin/tutorial/crm/backend/entity/Company';
import State from '../generated/com/vaadin/tutorial/crm/backend/entity/Company/State';
import Contact from '../generated/com/vaadin/tutorial/crm/backend/entity/Contact';
import Status from '../generated/com/vaadin/tutorial/crm/backend/entity/Contact/Status';

export class EntityStore {
  root: RootStore;
  contacts: Contact[] = [];
  statuses: Status[] = [];
  companies: Company[] = [];
  states: State[] = [];

  constructor(root: RootStore) {
    makeAutoObservable(this);
    this.root = root;

    when(() => this.root.auth.isLoggedIn, async () => {
      this.updateContacts();
      this.updateCompanies();
      const [states, statuses] =
        await Promise.all([getCompanyStates(), getContactStatuses()]);
      runInAction(() => {
        this.states = states;
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

  private async updateCompanies() {
    const companies = await findAllCompanies();
    runInAction(() => this.companies = companies);
  }

  async saveCompany(company: Company) {
    // optimistic UI update
    const idx = this.companies.findIndex(c => c.id === company.id);
    if (idx > -1) {
      this.companies[idx] = company;
    } else {
      this.companies.push(company);
    }

    // update the backend and re-sync the UI
    await saveCompany(company);
    await this.updateCompanies();
  }

  async deleteCompany(company: Company) {
    // optimistic UI update
    const idx = this.companies.findIndex(c => c.id === company.id);
    if (idx > -1) {
      this.companies.splice(idx, 1);
    }

    // update the backend and re-sync the UI
    await deleteCompany(company);
    await this.updateCompanies();
  }
}
