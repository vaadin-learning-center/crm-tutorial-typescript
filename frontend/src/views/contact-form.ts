import { css, customElement, html, LitElement, property } from 'lit-element';

import '@vaadin/vaadin-text-field';
import '@vaadin/vaadin-text-field/vaadin-email-field';
import '@vaadin/vaadin-combo-box';
import '@vaadin/vaadin-button';
import Company from '../../generated/com/vaadin/tutorial/crm/backend/service/endpoint/Company';
import Contact from '../../generated/com/vaadin/tutorial/crm/backend/service/endpoint/Contact';
import { ContactModel } from './contact-model';

@customElement('contact-form')
export class ContactForm extends LitElement {
  @property({ type: Array })
  companies: Company[] = [];

  @property({ type: Array })
  statuses: string[] = [];

  @property({ type: Object })
  contact: Contact = new ContactModel();

  static styles = css`
    :host {
      display: grid;
      gap: var(--lumo-space-m);
      grid-template-columns: 1fr;
      grid-auto-rows: min-content;
    }

    .buttons {
      display: grid;
      gap: var(--lumo-space-m);
      grid-template-columns: repeat(3, 1fr);
    }
  `;

  render() {
    if (!this.contact) return html`No contact selected`;

    return html`
      <vaadin-text-field
        label="First name"
        .value=${this.contact.firstName}
        @change=${(e: { target: { value: string } }) =>
          this.updateModel('firstName', e.target.value)}
      ></vaadin-text-field>
      <vaadin-text-field
        label="Last name"
        .value=${this.contact.lastName}
        @change=${(e: { target: { value: string } }) =>
          this.updateModel('lastName', e.target.value)}
      ></vaadin-text-field>
      <vaadin-email-field
        label="Email"
        name="email"
        .value=${this.contact.email}
        @change=${(e: { target: { value: string } }) =>
          this.updateModel('email', e.target.value)}
      ></vaadin-email-field>
      <vaadin-combo-box
        label="Company"
        item-label-path="name"
        item-id-path="id"
        .items=${this.companies}
        .selectedItem=${this.contact.company}
        @selected-item-changed=${(e: { target: { selectedItem: Company } }) =>
          this.updateModel('company', e.target.selectedItem)}
      ></vaadin-combo-box>
      <vaadin-combo-box
        label="Status"
        .items=${this.statuses}
        .value=${this.contact.status}
        @change=${(e: { target: { value: string } }) =>
          this.updateModel('status', e.target.value)}
      ></vaadin-combo-box>

      <div class="buttons">
        <vaadin-button @click=${this.save} theme="primary">Save</vaadin-button>
        <vaadin-button @click=${this.delete} theme="error"
          >Delete</vaadin-button
        >
        <vaadin-button @click=${this.cancel} theme="tertiary"
          >Cancel</vaadin-button
        >
      </div>
    `;
  }

  updateModel(property: string, value: any) {
    this.contact = Object.assign({}, this.contact, { [property]: value });
  }

  save() {
    this.dispatchEvent(
      new CustomEvent('contact-saved', {
        bubbles: true,
        composed: true,
        detail: { contact: this.contact },
      })
    );
  }

  delete() {
    this.dispatchEvent(
      new CustomEvent('contact-deleted', {
        bubbles: true,
        composed: true,
        detail: { contact: this.contact },
      })
    );
  }

  cancel() {
    this.dispatchEvent(
      new CustomEvent('cancel-editing', {
        bubbles: true,
        composed: true,
      })
    );
  }
}
