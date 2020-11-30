import { customElement, html, LitElement, property } from 'lit-element';

import '@vaadin/vaadin-text-field';
import '@vaadin/vaadin-text-field/vaadin-text-area';
import '@vaadin/vaadin-combo-box';
import '@vaadin/vaadin-button';
import Company from '../../generated/com/vaadin/tutorial/crm/backend/entity/Company';
import CompanyModel from "../../generated/com/vaadin/tutorial/crm/backend/entity/CompanyModel";
import State from "../../generated/com/vaadin/tutorial/crm/backend/entity/Company/State";
import { Binder, field } from '@vaadin/form';
import { Lumo } from '../../utils/lumo';

import styles from './company-form.css';


@customElement('company-form')
export class CompanyForm extends LitElement {

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
  onSubmit = (_: Company) => Promise.resolve();

  @property({ type: Function })
  onDelete = (_: Company) => Promise.resolve();

  @property({ type: Function })
  onCancel = (_: Company) => Promise.resolve();

  @property({ type: Array })
  states: State[] = [];

  @property({ type: Object })
  set company(value: Company){
    this.binder.read(value);
  }

  static styles = [ Lumo, styles ];

  private binder = new Binder(this, CompanyModel);

  render() {
    if (!this.binder.value) return html`No company selected`;

    return html`
      <vaadin-text-field
        label="Name"
        ...="${field(this.binder.model.name)}"
      ></vaadin-text-field>
      <vaadin-text-area
        label="Description"
        ...="${field(this.binder.model.description)}"
      ></vaadin-text-area>
      <vaadin-combo-box
        label="State"
        .items=${this.states}
        ...="${field(this.binder.model.state)}"
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
