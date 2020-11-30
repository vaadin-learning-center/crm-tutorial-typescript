import { customElement, html } from 'lit-element';
import { MobxLitElement } from '@adobe/lit-mobx';
import { classMap } from 'lit-html/directives/class-map';
import '@vaadin/vaadin-grid';
import '@vaadin/vaadin-text-field';
import '@vaadin/vaadin-button';
import '../company-form/company-form';
import { sortAndFilterGridHeaderRenderer } from '../sortAndFilterGridHeaderRenderer';

import Company from '../../generated/com/vaadin/tutorial/crm/backend/entity/Company';
import { Lumo } from '../../utils/lumo';
import styles from './companies-view.css';
import { rootStore } from '../../stores';
import { CompanyListStore } from './companies-store';

const state = new CompanyListStore(rootStore);

@customElement('companies-view')
export class CompaniesView extends MobxLitElement {
  static styles = [Lumo, styles];

  render() {
    return html`
      <div
        class=${classMap({
      wrapper: true,
      editing: Boolean(state.selectedCompany),
    })}
      >
        <div class="toolbar">
          <vaadin-text-field
            clear-button-visible
            placeholder="Search"
            @input=${(e: any) => state.setFilter(e.target.value)}
          ></vaadin-text-field>
          <vaadin-button
            @click=${() => state.addNewCompany()}
            >Add company</vaadin-button
          >
        </div>
        <div class="content">
          <vaadin-grid
            class="companies-grid"
            .items=${state.filteredCompanies}
            .selectedItems=${state.selectedCompany ? [state.selectedCompany] : []}
            @active-item-changed=${this.onGridSelectionChanged}
            multi-sort
          >
            <vaadin-grid-column
              path="name"
              header="Name"
              .headerRenderer="${sortAndFilterGridHeaderRenderer}"
              auto-width
            ></vaadin-grid-column>

            <vaadin-grid-column
              path="description"
              header="Description"
              .headerRenderer="${sortAndFilterGridHeaderRenderer}"
              auto-width
            ></vaadin-grid-column>

            <vaadin-grid-column
              path="employees.length"
              header="# of employees"
              .headerRenderer="${sortAndFilterGridHeaderRenderer}"
              auto-width
            ></vaadin-grid-column>

            <vaadin-grid-column
              path="state"
              header="State"
              .headerRenderer="${sortAndFilterGridHeaderRenderer}"
              auto-width
            ></vaadin-grid-column>
          </vaadin-grid>
          <company-form
            class="company-form"
            .company=${state.selectedCompany}
            .states=${rootStore.entities.states}
            .onSubmit="${(company: Company) => state.saveCompany(company)}"
            .onDelete="${(company: Company) => state.deleteCompany(company)}"
            .onCancel="${() => state.clearSelection()}"
          ></company-form>
        </div>
      </div>
    `;
  }

  private onGridSelectionChanged(e: { detail: { value?: Company } }) {
    // Changing the state synchronously causes a MobX warning
    //
    // state.setSelected(e.detail.value)
    //
    // [MobX] Since strict-mode is enabled, changing (observed) observable
    // values without using an action is not allowed.
    // Tried to modify: CompanyListState@2.selectedCompanyId
    //
    // Most likely, it's because the first time this event is triggered by
    // vaadin-grid synchronously at the first render, which itself happens
    // as a MobX reaction and is not expected to call actions directly.
    setTimeout(() => state.setSelectedCompany(e.detail.value), 0);
  }
}
