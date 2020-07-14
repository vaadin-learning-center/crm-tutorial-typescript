import { customElement, html, LitElement, property } from 'lit-element';
import { classMap } from 'lit-html/directives/class-map';
import {
  find,
  saveContact,
  deleteContact,
  getContactStatuses,
  findAllCompanies,
} from '../../generated/ServiceEndpoint';
import '@vaadin/vaadin-grid';
import '@vaadin/vaadin-text-field';
import '@vaadin/vaadin-button';

import Contact from '../../generated/com/vaadin/tutorial/crm/backend/service/endpoint/Contact';
import Company from '../../generated/com/vaadin/tutorial/crm/backend/service/endpoint/Company';
import './contact-form';
import { ContactModel } from './contact-model';
import Status from "../../generated/com/vaadin/tutorial/crm/backend/entity/Contact/Status";
import {Lumo} from "../../styles/lumo";
import styles from "./list-view.css";

@customElement('list-view')
export class ListView extends LitElement {
  @property({ type: Array })
  private contacts: Contact[] = [];

  @property({ type: Object })
  private currentContact: Contact | null = null;

  @property({ type: Array })
  private companies: Company[] = [];

  @property({ type: Array })
  private statuses: Status[] = [];

  private filterText = '';

  static styles = [ Lumo, styles ];

  render() {
    return html`
      <div
        class=${classMap({
          wrapper: true,
          editing: this.currentContact != null,
        })}
      >
        <div class="toolbar">
          <vaadin-text-field
            clear-button-visible
            placeholder="Search"
            @input=${(e: any) => this.filter(e.target.value)}
          ></vaadin-text-field>
          <vaadin-button
            @click=${() => (this.currentContact = new ContactModel())}
            >Add contact</vaadin-button
          >
        </div>
        <div class="content">
          <vaadin-grid
            class="contacts-grid"
            .items=${this.contacts}
            .selectedItems=${this.currentContact ? [this.currentContact] : []}
            @active-item-changed=${(e: {
              detail: { value: Contact | null };
              target: any;
            }) => (this.currentContact = e.detail.value)}
          >
            <vaadin-grid-column
              path="firstName"
              header="First name"
              auto-width
            ></vaadin-grid-column>

            <vaadin-grid-column
              path="lastName"
              header="Last name"
              auto-width
            ></vaadin-grid-column>

            <vaadin-grid-column
              path="company.name"
              header="Company"
              auto-width
            ></vaadin-grid-column>

            <vaadin-grid-column
              path="email"
              header="Email"
              auto-width
            ></vaadin-grid-column>

            <vaadin-grid-column
              path="status"
              header="Status"
              auto-width
            ></vaadin-grid-column>
          </vaadin-grid>
          <contact-form
            class="contact-form"
            .contact=${this.currentContact}
            .companies=${this.companies}
            .statuses=${this.statuses}
            @contact-saved=${this.save}
            @contact-deleted=${this.delete}
            @cancel-editing=${this.clear}
          ></contact-form>
        </div>
      </div>
    `;
  }

  async save(e: { detail: { contact: Contact } }) {
    await saveContact(e.detail.contact);
    this.clear();
    this.updateContacts();
  }

  async delete(e: { detail: { contact: Contact } }) {
    await deleteContact(e.detail.contact);
    this.clear();
    this.updateContacts();
  }

  clear() {
    this.currentContact = null;
  }

  async filter(filter: string) {
    console.log(filter);
    this.filterText = filter;
    this.updateContacts();
  }

  async updateContacts() {
    this.contacts = await find(this.filterText);
  }

  async firstUpdated() {
    this.filter('');
    this.statuses = await getContactStatuses();
    this.companies = await findAllCompanies();
  }
}
