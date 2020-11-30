import { customElement, html, query } from 'lit-element';
import { MobxLitElement } from '@adobe/lit-mobx';
import { IReactionDisposer, reaction } from "mobx";
import { classMap } from 'lit-html/directives/class-map';
import '@vaadin/vaadin-grid';
import type { GridDataProvider, GridElement } from '@vaadin/vaadin-grid';
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

  @query('vaadin-grid')
  private grid!: GridElement;

  private disposeGridRefreshReaction!: IReactionDisposer;

  private extractors = {
    "name": (c: Company) => c.name,
    "description": (c: Company) => c.description || '',
    "employees.length": (c: Company) => (c.employees || []).length,
    "state": (c: Company) => (c.state + '') || '',
  };

  private matcher = (value: string | number, filter: string) =>
    (value + '').toLowerCase().includes(filter);

  private matchers = {
    "name": (c: Company, filter: string) =>
      this.matcher(this.extractors['name'](c), filter),
    "description": (c: Company, filter: string) =>
      this.matcher(this.extractors['description'](c), filter),
    "employees.length": (c: Company, filter: string) =>
      this.matcher(this.extractors['employees.length'](c), filter),
    "state": (c: Company, filter: string) =>
      this.matcher(this.extractors['state'](c), filter),
  };

  private dataProvider: GridDataProvider = (params, callback) => {
    console.log(`[grid] fetching a page of companies: filter = '${state.filter}', params = `, params);
    const filter = state.filter.toLowerCase();
    const filtered = rootStore.entities.companies
      .filter(c => {
        // check if the grid item passes the general filter
        const passing = filter === '' ||
          this.matchers['name'](c, filter) ||
          this.matchers['description'](c, filter) ||
          this.matchers['employees.length'](c, filter) ||
          this.matchers['state'](c, filter);

        // check if the grid item passes the grid column filters
        return params.filters.reduce(
          (passing, filter) => {
            if (passing && !!filter.value) {
              const m = this.matchers;
              const prop = filter.path as keyof typeof m;
              return this.matchers[prop](c, filter.value.toLowerCase())
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

        const e = this.extractors;
        const prop = sorter.path as keyof typeof e;
        const value1 = this.extractors[prop](c1);
        const value2 = this.extractors[prop](c2);

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
    this.disposeGridRefreshReaction = reaction(
      () => {
        // The grid keeps its own cache of items and the content
        // that users see is based on it. The grid cache may get
        // out of sync with the company data in the entity store,
        // or with the filter in the Company List UI store. In any
        // case, that would lead to inconsistent data shown to the
        // user:
        //  1. [grid is out of sync with the entity store]
        //     This happens when there is no filters, and the user
        //     selects a company in the grid, updates e.g. its name
        //     and presses the Save button. The company in the entity
        //     store is updated, but the grid is not. In this case
        //     the corresponding row in the grid should be updated
        //     as well.
        //  2. [grid is out of sync with the Company List UI store]
        //     This happens when the user sets a filter above the
        //     grid. The Company List UI store is updated, but the
        //     grid is not. In this case the grid content should be
        //     re-fetched from the entity store taking the updated
        //     filter into account.
        //     This also happens if there is a filter, and the user
        //     updates a company so that it no longer matches the
        //     filter. In this case it should be removed from the
        //     grid as well.
        //
        // Ideally, the grid should be able to subscribe to updates
        // to the specific items that it currently keeps in its
        // cache (and unsubscribe when it removes items from its
        // cache). That would solve the entity store / grid sync
        // issues, and leave only the UI state / grid sync up to the
        // developer.
        //
        // In that case the reaction expression would be simple:
        //   return state.filter.toLowerCase();
        //
        // In reality vaadin-grid knows nothing of MobX observable
        // values and does not subscribe to their updates. Nor does
        // it provide any APIs to hook into its cache lifecycle,
        // and therefore the only choice at the moment is to call
        // the performance-heavy grid.clearCache() method every
        // time when the grid cache _may_ have become inconsistent
        // with either of the stores.
        //
        // Doing this through a MobX reaction is taxing, both
        // computationally and memory-wise. Without knowing which
        // companies are currently in the grid's cache, this
        // reaction subscribes to changes in _all_ companies loaded
        // into the entity store. As the number of companies
        // increases this may become a performance bottleneck.
        //
        // This reaction also computes and stores in memory a textual
        // representation of all content that _may_ be visible in
        // the grid (again, without knowing which page is actually
        // displayed). This is done because MobX compares the return
        // value of the expression fn. and only runs the reaction fn.
        // when that value changes. This effectively duplicates the
        // memory footprint of the companies data in the entity store.
        // This latter part could be optimized by storing only a hash
        // of the content.
        //
        // A pragmatic much more performant solution would be to give
        // up on reactivity in this case and imperatively call
        // `grid.clearCache()` at every point that may change the grid
        // content (e.g. in the company edit form).
        const filter = state.filter.toLowerCase();
        return rootStore.entities.companies
          .filter(c => filter === '' ||
                this.matchers['name'](c, filter) ||
                this.matchers['description'](c, filter) ||
                this.matchers['employees.length'](c, filter) ||
                this.matchers['state'](c, filter))
          .map(c =>
            [
              this.extractors['name'](c),
              this.extractors['description'](c),
              this.extractors['employees.length'](c),
              this.extractors['state'](c)
            ].join(';'))
          .join('\n');
      },
      () => {
        this.grid.clearCache();
      });
  }

  disconnectedCallback() {
    this.disposeGridRefreshReaction();
    super.disconnectedCallback();
  }

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
            .dataProvider="${this.dataProvider}"
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
