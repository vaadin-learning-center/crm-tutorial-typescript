import { css, customElement, html, LitElement, property } from 'lit-element';

import '@vaadin/vaadin-text-field';
import '@vaadin/vaadin-text-field/vaadin-email-field';
import '@vaadin/vaadin-combo-box';
import '@vaadin/vaadin-button';
import Company from '../../generated/com/vaadin/tutorial/crm/backend/entity/Company';
import Contact from '../../generated/com/vaadin/tutorial/crm/backend/entity/Contact';
import ContactModel from '../../generated/com/vaadin/tutorial/crm/backend/entity/ContactModel';
import { Binder, field } from '@vaadin/form';

@customElement('contact-form')
export class ContactForm extends LitElement {
  @property({ type: Array })
  companies: Company[] = [];

  @property({ type: Array })
  statuses: string[] = [];

  @property({ type: Object })
  set contact(value: Contact){
    this.binder.read(value);
  }

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

  private binder = new Binder(this, ContactModel);

  render() {
    if (!this.binder.value) return html`No contact selected`;

    return html`
      <vaadin-text-field
        label="First name"
        ...="${field(this.binder.model.firstName)}"
      ></vaadin-text-field>
      <vaadin-text-field
        label="Last name"
        ...="${field(this.binder.model.lastName)}"
      ></vaadin-text-field>
      <vaadin-email-field
        label="Email"
        ...="${field(this.binder.model.email)}"
      ></vaadin-email-field>
      <vaadin-combo-box
        label="Company"
        item-label-path="name"
        item-value-path="id"
        .items=${this.companies}
        ...="${field(this.binder.model.company.id)}"
      ></vaadin-combo-box>
      <vaadin-combo-box
        label="Status"
        .items=${this.statuses}
        ...="${field(this.binder.model.status)}"
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

  save() {
    this.dispatchEvent(
      new CustomEvent('contact-saved', {
        bubbles: true,
        composed: true,
        detail: { contact: this.binder.value },
      })
    );
  }

  delete() {
    this.dispatchEvent(
      new CustomEvent('contact-deleted', {
        bubbles: true,
        composed: true,
        detail: { contact: this.binder.value },
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
