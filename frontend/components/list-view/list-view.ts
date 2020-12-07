import { customElement, html, LitElement, property } from 'lit-element';
import { connect } from 'pwa-helpers';
import { classMap } from 'lit-html/directives/class-map';
import {
  initCompanies,
  initContacts,
  initStatuses,
  deleteContact,
  saveContact,
  selectAllCompanies,
} from '../../store/entities';
import {
  addNewContact,
  clearSelection,
  filteredContactsSelector,
  selectedContactSelector,
  setSelectedContact,
  setFilter,
  contactListReducer,
} from './list-view.store';
import '@vaadin/vaadin-grid';
import '@vaadin/vaadin-text-field';
import '@vaadin/vaadin-button';
import '../contact-form/contact-form';
import type { ComboBoxDataProvider } from '@vaadin/vaadin-combo-box';
import { sortAndFilterGridHeaderRenderer } from '../sortAndFilterGridHeaderRenderer';

import type { Company, Contact } from '../../store/entities';
import type BackendContact from '../../generated/com/vaadin/tutorial/crm/backend/entity/Contact';
import Status from '../../generated/com/vaadin/tutorial/crm/backend/entity/Contact/Status';
import { Lumo } from '../../utils/lumo';
import styles from './list-view.css';

import type { ContactsViewRootState } from './list-view.store';
import { store } from '../../store';

// lazy-load the contacts view slice in the Redux store
// @ts-ignore
store.attachReducers({ contactList: contactListReducer });

@customElement('list-view')
export class ListView extends connect(store)(LitElement) {
  @property({ type: Array })
  private contacts: Contact[] = [];

  @property({ type: Object })
  private selectedContact?: BackendContact = undefined;

  @property({ type: Array })
  private companies: Company[] = [];

  @property({ type: Array })
  private statuses: Status[] = [];

  stateChanged(state: ContactsViewRootState) {
    this.contacts = filteredContactsSelector(state);
    this.selectedContact = selectedContactSelector(state);
    this.companies = selectAllCompanies(state.entities.companies);
    this.statuses = state.entities.statuses;
  }

  private companyCbDataProvider: ComboBoxDataProvider = (params, callback) => {
    console.log(`[combo-box] fetching a page of companies: params = `, params);
    const filtered = this.companies
      .filter(c => {
        const filter = params.filter.toLowerCase();
        return !filter || c.name.toLowerCase().includes(filter);
      });

    const slice = filtered.slice(params.page * params.pageSize,
      params.page * params.pageSize + params.pageSize);

    callback(slice, filtered.length);
  }

  static styles = [Lumo, styles];

  connectedCallback() {
    super.connectedCallback();
    store.dispatch(initContacts(null));
    store.dispatch(initCompanies(null));
    store.dispatch(initStatuses(null));
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
            @input=${(e: any) => store.dispatch(setFilter(e.target.value))}
          ></vaadin-text-field>
          <vaadin-button
            @click=${() => store.dispatch(addNewContact())}
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
            .companies=${this.companyCbDataProvider}
            .statuses=${this.statuses}
            .onSubmit="${(contact: BackendContact) => this.saveContact(contact)}"
            .onDelete="${(contact: BackendContact) => this.deleteContact(contact)}"
            .onCancel="${() => store.dispatch(clearSelection())}"
          ></contact-form>
        </div>
      </div>
    `;
  }

  private saveContact(contact: BackendContact) {
    store.dispatch(saveContact(contact));
    store.dispatch(clearSelection());
  }

  private deleteContact(contact: BackendContact) {
    store.dispatch(deleteContact(contact));
    store.dispatch(clearSelection());
  }

  private onGridSelectionChanged(e: { detail: { value?: Contact } }) {
    store.dispatch(setSelectedContact(e.detail.value));
  }
}
