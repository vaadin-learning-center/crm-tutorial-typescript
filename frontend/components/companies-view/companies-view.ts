import { customElement, html, LitElement, property, query } from 'lit-element';
import { connect } from 'pwa-helpers';
import { classMap } from 'lit-html/directives/class-map';
import {
  initCompanies,
  initStates,
  deleteCompany,
  saveCompany,
  selectAllCompanies,
} from '../../store/entities';
import {
  addNewCompany,
  clearSelection,
  extractors,
  filteredGridContentSelector,
  matchers,
  selectedCompanySelector,
  setSelectedCompany,
  setFilter,
  companyListReducer,
} from './companies-view.store';
import '@vaadin/vaadin-grid';
import type { GridDataProvider, GridElement } from '@vaadin/vaadin-grid';
import '@vaadin/vaadin-text-field';
import '@vaadin/vaadin-button';
import '../company-form/company-form';
import { sortAndFilterGridHeaderRenderer } from '../sortAndFilterGridHeaderRenderer';

import type { Company } from '../../store/entities';
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

  @property({ type: String })
  private filter = '';

  @property({ type: Object })
  private selectedCompany?: Company = undefined;

  @property({ type: Array })
  private states: State[] = [];

  stateChanged(state: CompaniesViewRootState) {
    this.filter = state.companyList.filter;
    this.companies = selectAllCompanies(state.entities.companies);
    this.selectedCompany = selectedCompanySelector(state);
    this.states = state.entities.states;

    // The grid keeps its own cache of items and the content that
    // users see is based on it. The grid cache may get out of
    // sync with the company data in the entity store or with
    // the filter in the Company List view store. In any case,
    // that would lead to inconsistent data shown to the user:
    //  1. [grid is out of sync with the companies data in the
    //     entity store]
    //     This happens when there is no filters, and the user
    //     selects a company in the grid, updates e.g. its name
    //     and presses the Save button. The companies data in
    //     the store is updated, but the grid is not. In this
    //     case the corresponding row in the grid should be
    //     updated as well.
    //  2. [grid is out of sync with the Company List state]
    //     This happens when the user sets a filter above the
    //     grid. The Company List state is updated, but the
    //     grid is not. In this case the grid content should be
    //     re-fetched from the company entity store taking the
    //     updated filter into account.
    //     This also happens if there is a filter, and the user
    //     updates a company so that it no longer matches the
    //     filter. In this case it should be removed from the
    //     grid as well.
    //
    // Ideally, the grid should subscribe to the store changes
    // and re-select the data it wants to keep in its cache from
    // the store directly.
    //
    // In reality vaadin-grid knows nothing of Redux store. Nor
    // does it provide any APIs to hook into its cache lifecycle,
    // and therefore the only choice at the moment is to call
    // the performance-heavy grid.clearCache() method every
    // time when the grid cache _may_ have become inconsistent
    // with the store (either entities or the filter).
    //
    // Doing this on every state change is taxing, both
    // computationally and memory-wise. As an optimization, the
    // code here stores in memory a textual representation of all
    // content that _may_ be visible in the grid (without knowing
    // which page is actually displayed), and updates the grid
    // cache only if it changes. This effectively duplicates the
    // memory footprint of the companies list in the Redux store.
    // It could be optimized a little by storing only a hash of
    // the content.
    //
    // A pragmatic much more performant solution would be to give
    // up on reactivity in this case and imperatively call
    // `grid.clearCache()` at every point that may change the grid
    // content (e.g. in the company edit form).
    // TODO: find an efficient way to keep the grid in sync with the store state
    const filteredGridContent = filteredGridContentSelector(state);
    if (filteredGridContent != this.filteredGridContent) {
      this.filteredGridContent = filteredGridContent;
      this.grid?.clearCache();
    }
  }

  @query('vaadin-grid')
  private grid?: GridElement;

  private filteredGridContent = '';

  static styles = [Lumo, styles];

  private dataProvider: GridDataProvider = (params, callback) => {
    console.log(`[grid] fetching a page of companies: filter = '${this.filter}', params = `, params);
    const filter = this.filter.toLowerCase();
    const filtered = this.companies
      .filter(c => {
        // check if the grid item passes the general filter
        const passing = filter === '' ||
          matchers['name'](c, filter) ||
          matchers['description'](c, filter) ||
          matchers['employees.length'](c, filter) ||
          matchers['state'](c, filter);

        // check if the grid item passes the grid column filters
        return params.filters.reduce(
          (passing, filter) => {
            if (passing && !!filter.value) {
              const prop = filter.path as keyof typeof matchers;
              return matchers[prop](c, filter.value.toLowerCase())
            }
            return passing;
          }, passing);
      });

    // sort in place
    filtered.sort((c1, c2) => {
      return params.sortOrders.reduce((order, sorter) => {
        if (order !== 0) {
          return order;
        }

        const prop = sorter.path as keyof typeof extractors;
        const value1 = extractors[prop](c1);
        const value2 = extractors[prop](c2);

        order = value1 == value2 ? 0 : value1 < value2 ? -1 : +1;
        if (sorter.direction === 'desc') {
          order = -order;
        }
        return order;
      }, 0);
    });

    const slice = filtered.slice(params.page * params.pageSize,
      params.page * params.pageSize + params.pageSize);

    callback(slice, filtered.length);
  }

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
            .dataProvider=${this.dataProvider}
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
