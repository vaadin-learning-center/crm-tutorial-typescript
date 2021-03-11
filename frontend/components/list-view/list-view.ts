import { customElement, html, LitElement, property, query } from 'lit-element';
import { classMap } from 'lit-html/directives/class-map';
import {
  find,
  saveContact,
  deleteContact,
  getContactStatuses,
  findAllCompanies,
} from 'Frontend/generated/ServiceEndpoint';
import '@vaadin/vaadin-grid';
import { GridElement } from '@vaadin/vaadin-grid';
import '@vaadin/vaadin-text-field';
import '@vaadin/vaadin-button';
import 'Frontend/components/contact-form/contact-form';
import { sortAndFilterGridHeaderRenderer } from 'Frontend/components/sortAndFilterGridHeaderRenderer';

import Company from 'Frontend/generated/com/vaadin/tutorial/crm/backend/entity/Company';
import Contact from 'Frontend/generated/com/vaadin/tutorial/crm/backend/entity/Contact';
import ContactModel from 'Frontend/generated/com/vaadin/tutorial/crm/backend/entity/ContactModel';
import Status from 'Frontend/generated/com/vaadin/tutorial/crm/backend/entity/Contact/Status';
import { applyTheme } from 'Frontend/generated/theme';
import styles from './list-view.css';

@customElement('list-view')
export class ListView extends LitElement {
  @query('vaadin-grid')
  private grid!: GridElement;

  @property({ type: Array })
  private contacts: Contact[] = [];

  @property({ type: Object })
  private selectedContact?: Contact = undefined;

  @property({ type: Array })
  private companies: Company[] = [];

  @property({ type: Array })
  private statuses: Status[] = [];

  @property({ type: String })
  private filter = '';

  static styles = [styles];

  async connectedCallback() {
    super.connectedCallback();
    this.updateContacts();
    this.statuses = await getContactStatuses();
    this.companies = await findAllCompanies();

    applyTheme(this.shadowRoot!);
  }

  render() {
    return html`
      <div
        class=${classMap({
          wrapper: true,
          editing: Boolean(this.selectedContact),
        })}
      >
        <div class="toolbar">
          <vaadin-text-field
            clear-button-visible
            placeholder="Search"
            @input=${(e: any) => this.setFilter(e.target.value)}
          ></vaadin-text-field>
          <vaadin-button
            @click=${() => this.addNewContact()}
            >Add contact</vaadin-button
          >
        </div>
        <div class="content">
          <vaadin-grid
            class="contacts-grid"
            .items=${this.contacts}
            .selectedItems=${this.selectedContact ? [this.selectedContact] : []}
            @active-item-changed=${this.onGridSelectionChanged}
            multi-sort
          >
            <vaadin-grid-column
              path="firstName"
              header="First name"
              .headerRenderer="${sortAndFilterGridHeaderRenderer}"
              auto-width
            ></vaadin-grid-column>

            <vaadin-grid-column
              path="lastName"
              header="Last name"
              .headerRenderer="${sortAndFilterGridHeaderRenderer}"
              auto-width
            ></vaadin-grid-column>

            <vaadin-grid-column
              path="company.name"
              header="Company"
              .headerRenderer="${sortAndFilterGridHeaderRenderer}"
              auto-width
            ></vaadin-grid-column>

            <vaadin-grid-column
              path="email"
              header="Email"
              .headerRenderer="${sortAndFilterGridHeaderRenderer}"
              auto-width
            ></vaadin-grid-column>

            <vaadin-grid-column
              path="status"
              header="Status"
              .headerRenderer="${sortAndFilterGridHeaderRenderer}"
              auto-width
            ></vaadin-grid-column>
          </vaadin-grid>
          <contact-form
            class="contact-form"
            .contact=${this.selectedContact}
            .companies=${this.companies}
            .statuses=${this.statuses}
            .onSubmit="${(contact: Contact) => this.saveContact(contact)}"
            .onDelete="${(contact: Contact) => this.deleteContact(contact)}"
            .onCancel="${() => this.clearSelection()}"
          ></contact-form>
        </div>
      </div>
    `;
  }

  private addNewContact() {
    this.selectedContact = ContactModel.createEmptyValue();
  }

  private async saveContact(contact: Contact) {
    // optimistic UI update
    this.clearSelection();
    const idx = this.contacts.findIndex(c => c.id === contact.id);
    if (idx > -1) {
      // replace the contact with the matching id
      this.contacts[idx] = contact;
      // explicitly triggering a grid refresh because the contacts array is update in-place
      this.grid.clearCache();
    } else {
      // append a new contact to the contacts list
      this.contacts.push(contact);
      // explicitly triggering a grid refresh because the contacts array is update in-place
      this.grid.clearCache();
    }

    // update the backend and re-sync the UI
    await saveContact(contact);
    await this.refreshContacts();
  }

  private async deleteContact(contact: Contact) {
    // optimistic UI update
    this.clearSelection();
    const idx = this.contacts.findIndex(c => c.id === contact.id);
    if (idx > -1) {
      this.contacts.splice(idx, 1);
      // explicitly triggering a grid refresh because the contacts array is update in-place
      this.grid.clearCache();
    }

    // update the backend and re-sync the UI
    await deleteContact(contact);
    await this.refreshContacts();
  }

  private async refreshContacts() {
    this.clearSelection();
    await this.updateContacts();
  }

  private clearSelection() {
    this.selectedContact = undefined;
  }

  private async setFilter(filter: string) {
    this.filter = filter;
    await this.updateContacts();
  }

  private async updateContacts() {
    this.contacts = await find(this.filter);

    // re-sync the editor form with the grid (so that it works with the same JS contact instance)
    // This allows to keep the grid highlighting for the selected contact when the filter changes
    if (this.selectedContact && this.selectedContact.id !== 0) {
      this.selectedContact = this.contacts.find(c => c.id === this.selectedContact?.id);
    }
  }

  private onGridSelectionChanged(e: { detail: { value?: Contact } }) {
    this.selectedContact = e.detail.value;
  }
}
