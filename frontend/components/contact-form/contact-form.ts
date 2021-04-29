import { customElement, html, LitElement, property } from 'lit-element';

import '@vaadin/vaadin-text-field';
import '@vaadin/vaadin-text-field/vaadin-email-field';
import '@vaadin/vaadin-combo-box';
import '@vaadin/vaadin-button';
import Company from '../../generated/com/vaadin/tutorial/crm/backend/entity/Company';
import Contact from '../../generated/com/vaadin/tutorial/crm/backend/entity/Contact';
import ContactModel from '../../generated/com/vaadin/tutorial/crm/backend/entity/ContactModel';
import Status from '../../generated/com/vaadin/tutorial/crm/backend/entity/Contact/Status';
import { Binder, field } from '@vaadin/form';
import { Lumo } from '../../utils/lumo';

import styles from './contact-form.css';

@customElement('contact-form')
export class ContactForm extends LitElement {

  /*
   * The `submit` action cannot be handled with a DOM event
   * handler because the form needs to call the submit handler
   * and catch any validation exceptions that it could trigger.
   *
   * binder.submitTo(onSubmit);
   *
   * The other actions could be handled through DOM events
   * but for consistency reasons are implemented in the same way
   * as `submit`.
   */
  @property({ type: Function })
  onSubmit = (_: Contact) => Promise.resolve();

  @property({ type: Function })
  onDelete = (_: Contact) => Promise.resolve();

  @property({ type: Function })
  onCancel = (_: Contact) => Promise.resolve();

  @property({ type: Array })
  companies: Company[] = [];

  @property({ type: Array })
  statuses: Status[] = [];

  @property({ type: Object })
  set contact(value: Contact | undefined){
    this.binder.read(value || ContactModel.createEmptyValue());
  }

  static styles = [ Lumo, styles ];

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
        .items=${this.companies}
        ...="${field(this.binder.model.company)}"
      ></vaadin-combo-box>
      <vaadin-combo-box
        label="Status"
        .items=${this.statuses}
        ...="${field(this.binder.model.status)}"
      ></vaadin-combo-box>

      <div class="buttons">
        <vaadin-button @click=${this.save} theme="primary"
            ?disabled="${this.binder.invalid || this.binder.submitting || !this.binder.dirty}"
            >Save</vaadin-button>
        <vaadin-button @click=${this.delete} theme="error"
            ?disabled="${this.binder.value.id === 0}"
            >Delete</vaadin-button>
        <vaadin-button @click=${this.cancel} theme="tertiary" 
            >Cancel</vaadin-button>
      </div>
    `;
  }

  save() {
    return this.binder.submitTo(this.onSubmit);
  }

  delete() {
    return this.onDelete(this.binder.value);
  }

  cancel() {
    return this.onCancel(this.binder.value);
  }
}
