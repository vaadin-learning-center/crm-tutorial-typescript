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
import CompanyModel from '../generated/com/vaadin/tutorial/crm/backend/entity/CompanyModel';
import State from '../generated/com/vaadin/tutorial/crm/backend/entity/Company/State';
import Contact from '../generated/com/vaadin/tutorial/crm/backend/entity/Contact';
import ContactModel from '../generated/com/vaadin/tutorial/crm/backend/entity/ContactModel';
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
    runInAction(() => {
      // Create an id -> Contact map with all currently stored contacts
      const contactById = {} as {[k in string]: Contact};
      this.contacts.forEach(c => contactById[c.id] = c);

      // Iterate over the received contacts list and for all contacts that
      // are already currently stored (equal by id), replace the new JS
      // instances with the old JS instances, and then update all the
      // properties in the old JS instances to match the new values.
      //
      // This is done to keep direct JS references working (e.g. companies
      // in the Company domain store keep references to Contact objects
      // from this store. If the JS objects change, the Company store
      // becomes inconsistent with the Contact store).
      contacts.forEach((c, i) => {
        const stored = contactById[c.id];
        if (stored) {
          stored.firstName = c.firstName;
          stored.lastName = c.lastName;
          stored.email = c.email;
          stored.status = c.status;
          stored.company = c.company
            ? this.resolveCompany(c.company.id, c.company)
            : c.company;

          contacts[i] = stored;
        }
      });

      // replace the array object itself
      this.contacts = contacts;
    });
  }

  private resolveContact(id: Contact['id'], update: Partial<Contact>): Contact {
    const stored = this.contacts.find(c => c.id == id);
    if (stored) {
      Object.assign(stored, update); // mutate the stored object in place
      return stored;
    } else {
      const contact = {
        ...ContactModel.createEmptyValue(),
        ...update,
        id
      };
      this.contacts.push(contact);
      return contact;
    }
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
    runInAction(() => {
      // Create an 'id -> Company' map with all currently stored companies
      const companyById = {} as {[k in string]: Company};
      this.companies.forEach(c => companyById[c.id] = c);

      // Iterate over the received companies list and for all companies that
      // are already currently stored (equal by id), replace the new JS
      // instances with the old JS instances, and then update all the
      // properties in the old JS instances to match the new values.
      //
      // This is done to keep direct JS references working (e.g. contacts
      // in the Contact domain store keep references to Company objects
      // from this store. If the JS objects change, the Contact store
      // becomes inconsistent with the Company store).
      companies.forEach((c, i) => {
        const stored = companyById[c.id];
        if (stored) {
          stored.name = c.name;
          stored.description = c.description;
          stored.state = c.state;
          stored.employees = c.employees
            ? c.employees.map(e => this.resolveContact(e.id, e))
            : c.employees;

          companies[i] = stored;
        }
      });

      // replace the array object itself
      this.companies = companies;
    });
  }

  resolveCompany(id: Company['id'], update: Partial<Company>): Company {
    const stored = this.companies.find(c => c.id == id);
    if (stored) {
      Object.assign(stored, update); // mutate the stored object in place
      return stored;
    } else {
      const company = {
        ...CompanyModel.createEmptyValue(),
        ...update,
        id
      };
      this.companies.push(company);
      return company;
    }
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
