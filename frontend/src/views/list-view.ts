import { css, customElement, html, LitElement, property } from 'lit-element';
import { classMap } from 'lit-html/directives/class-map';
import {
  find,
  getContactStatuses,
  findAllCompanies,
} from '../../generated/ServiceEndpoint';
import '@vaadin/vaadin-grid';
import '@vaadin/vaadin-text-field';
import '@vaadin/vaadin-button';

import Contact from '../../generated/com/vaadin/tutorial/crm/backend/entity/Contact';
import Company from '../../generated/com/vaadin/tutorial/crm/backend/entity/Company';
import './contact-form';
import Status from "../../generated/com/vaadin/tutorial/crm/backend/entity/Contact/Status";
import ContactModel from '../../generated/com/vaadin/tutorial/crm/backend/entity/ContactModel';

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

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      padding: var(--lumo-space-m);
    }

    .wrapper {
      height: 100%;
    }

    .toolbar > * {
      margin-right: var(--lumo-space-m);
    }

    .toolbar {
      margin-bottom: var(--lumo-space-m);
    }

    .content {
      flex: 1;
      display: flex;
      height: 100%;
    }

    .contacts-grid {
      height: 100%;
      flex: 2;
    }

    .contact-form {
      flex: 2;
      min-width: 300px;
      margin-left: var(--lumo-space-m);
      display: none;
    }

    .editing .contact-form {
      display: grid;
    }

    @media (max-width: 1100px) {
      .editing .toolbar,
      .editing .contacts-grid {
        display: none;
      }
    }
  `;

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
            @click=${() => (this.currentContact = ContactModel.createEmptyValue())}
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
            @contact-saved=${this.refreshContacts}
            @contact-deleted=${this.refreshContacts}
            @cancel-editing=${this.clear}
          ></contact-form>
        </div>
      </div>
    `;
  }

  async refreshContacts() {
    this.clear();
    await this.updateContacts();
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
