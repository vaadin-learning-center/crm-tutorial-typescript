import { customElement, html, LitElement, property } from 'lit-element';
import { connect } from 'pwa-helpers';
import { classMap } from 'lit-html/directives/class-map';
import {
  initCompanies,
  initStates,
  deleteCompany,
  saveCompany,
} from '../../store/entities';
import {
  addNewCompany,
  clearSelection,
  filteredCompaniesSelector,
  selectedCompanySelector,
  setSelectedCompany,
  setFilter,
  companyListReducer,
} from './companies-view.store';
import '@vaadin/vaadin-grid';
import '@vaadin/vaadin-text-field';
import '@vaadin/vaadin-button';
import '../company-form/company-form';
import { sortAndFilterGridHeaderRenderer } from '../sortAndFilterGridHeaderRenderer';

import Company from '../../generated/com/vaadin/tutorial/crm/backend/entity/Company';
import State from '../../generated/com/vaadin/tutorial/crm/backend/entity/Company/State';
import { Lumo } from '../../utils/lumo';
import styles from './companies-view.css';

import type { CompaniesViewRootState } from './companies-view.store';
import { store } from '../../store';

// lazy-load the companies view slice in the Redux store
// @ts-ignore
store.attachReducers({ companyList: companyListReducer });

@customElement('companies-view')
export class CompaniesView extends connect(store)(LitElement) {
  @property({ type: Array })
  private companies: Company[] = [];

  @property({ type: Object })
  private selectedCompany?: Company = undefined;

  @property({ type: Array })
  private states: State[] = [];

  stateChanged(state: CompaniesViewRootState) {
    this.companies = filteredCompaniesSelector(state);
    this.selectedCompany = selectedCompanySelector(state);
    this.states = state.entities.states;
  }

  static styles = [Lumo, styles];

  connectedCallback() {
    super.connectedCallback();
    store.dispatch(initCompanies(null));
    store.dispatch(initStates(null));
  }

  render() {
    return html`
      <div
        class=${classMap({
      wrapper: true,
      editing: Boolean(this.selectedCompany),
    })}
      >
        <div class="toolbar">
          <vaadin-text-field
            clear-button-visible
            placeholder="Search"
            @input=${(e: any) => store.dispatch(setFilter(e.target.value))}
          ></vaadin-text-field>
          <vaadin-button
            @click=${() => store.dispatch(addNewCompany())}
            >Add company</vaadin-button
          >
        </div>
        <div class="content">
          <vaadin-grid
            class="companies-grid"
            .items=${this.companies}
            .selectedItems=${this.selectedCompany ? [this.selectedCompany] : []}
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
            .company=${this.selectedCompany}
            .states=${this.states}
            .onSubmit="${(company: Company) => this.saveCompany(company)}"
            .onDelete="${(company: Company) => this.deleteCompany(company)}"
            .onCancel="${() => store.dispatch(clearSelection())}"
          ></company-form>
        </div>
      </div>
    `;
  }

  private saveCompany(company: Company) {
    store.dispatch(saveCompany(company));
    store.dispatch(clearSelection());
  }

  private deleteCompany(company: Company) {
    store.dispatch(deleteCompany(company));
    store.dispatch(clearSelection());
  }

  private onGridSelectionChanged(e: { detail: { value?: Company } }) {
    store.dispatch(setSelectedCompany(e.detail.value));
  }
}
