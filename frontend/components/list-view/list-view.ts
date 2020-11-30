import { customElement, html } from 'lit-element';
import { MobxLitElement } from '@adobe/lit-mobx';
import { classMap } from 'lit-html/directives/class-map';
import '@vaadin/vaadin-grid';
import '@vaadin/vaadin-text-field';
import '@vaadin/vaadin-button';
import '../contact-form/contact-form';
import { sortAndFilterGridHeaderRenderer } from '../sortAndFilterGridHeaderRenderer';

import Contact from '../../generated/com/vaadin/tutorial/crm/backend/entity/Contact';
import { Lumo } from '../../utils/lumo';
import styles from './list-view.css';
import { rootStore } from '../../stores';

const state = rootStore.contactList;

@customElement('list-view')
export class ListView extends MobxLitElement {
  static styles = [Lumo, styles];

  render() {
    return html`
      <div
        class=${classMap({
          wrapper: true,
          editing: Boolean(state.selectedContact),
        })}
      >
        <div class="toolbar">
          <vaadin-text-field
            clear-button-visible
            placeholder="Search"
            @input=${(e: any) => state.setFilter(e.target.value)}
          ></vaadin-text-field>
          <vaadin-button
            @click=${() => state.addNewContact()}
            >Add contact</vaadin-button
          >
        </div>
        <div class="content">
          <vaadin-grid
            class="contacts-grid"
            .items=${state.filteredContacts}
            .selectedItems=${state.selectedContact ? [state.selectedContact] : []}
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
            .contact=${state.selectedContact}
            .companies=${rootStore.entities.companies}
            .statuses=${rootStore.entities.statuses}
            .onSubmit="${(contact: Contact) => state.saveContact(contact)}"
            .onDelete="${(contact: Contact) => state.deleteContact(contact)}"
            .onCancel="${() => state.clearSelection()}"
          ></contact-form>
        </div>
      </div>
    `;
  }

  private onGridSelectionChanged(e: { detail: { value?: Contact } }) {
    // Changing the state synchronously causes a MobX warning
    //
    // state.setSelected(e.detail.value)
    //
    // [MobX] Since strict-mode is enabled, changing (observed) observable
    // values without using an action is not allowed.
    // Tried to modify: ContactListState@2.selectedContactId
    //
    // Most likely, it's because the first time this event is triggered by
    // vaadin-grid synchronously at the first render, which itself happens
    // as a MobX reaction and is not expected to call actions directly.
    setTimeout(() => state.setSelectedContact(e.detail.value), 0);
  }
}
