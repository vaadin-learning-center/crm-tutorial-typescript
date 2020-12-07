import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import CompanyModel from '../../generated/com/vaadin/tutorial/crm/backend/entity/CompanyModel';

import type Company from '../../generated/com/vaadin/tutorial/crm/backend/entity/Company'
import type { RootState } from '../../store';

export interface CompaniesViewState {
  filter: string;
  selectedCompanyId?: Company['id'];
}

export type CompaniesViewRootState = RootState & {
  companyList: CompaniesViewState
};

const initialState: CompaniesViewState = {
  filter: '',
  selectedCompanyId: undefined
};

export const extractors = {
  "name": (c: Company) => c.name,
  "description": (c: Company) => c.description || '',
  "employees.length": (c: Company) => (c.employees || []).length,
  "state": (c: Company) => (c.state + '') || '',
};

const matcher = (value: string | number, filter: string) =>
  (value + '').toLowerCase().includes(filter.toLowerCase());

export const matchers = {
  "name": (c: Company, filter: string) =>
    matcher(extractors['name'](c), filter),
  "description": (c: Company, filter: string) =>
    matcher(extractors['description'](c), filter),
  "employees.length": (c: Company, filter: string) =>
    matcher(extractors['employees.length'](c), filter),
  "state": (c: Company, filter: string) =>
    matcher(extractors['state'](c), filter),
};

export const filteredGridContentSelector = createSelector(
  (state: RootState) => state.entities.companies,
  (state: CompaniesViewRootState) => state.companyList.filter,
  (companies, filter) => {
    console.log('calculating the filtered companies snapshot');
    return companies
      .filter(c => filter === '' ||
        matchers['name'](c, filter) ||
        matchers['description'](c, filter) ||
        matchers['employees.length'](c, filter) ||
        matchers['state'](c, filter))
      .map(c =>
        [
          extractors['name'](c),
          extractors['description'](c),
          extractors['employees.length'](c),
          extractors['state'](c)
        ].join(';'))
      .join('\n');
  }
);

export const selectedCompanySelector = createSelector(
  (state: CompaniesViewRootState) => state.entities.companies,
  (state: CompaniesViewRootState) => state.companyList.selectedCompanyId,
  (companies, selectedCompanyId) => {
    return selectedCompanyId === 0
      ? CompanyModel.createEmptyValue()
      : companies.find(c => c.id === selectedCompanyId);
  }
);

const companyListSlice = createSlice({
  name: 'companies-view',
  initialState,
  reducers: {
    addNewCompany(state) {
      state.selectedCompanyId = 0;
    },
    setFilter(state, action: PayloadAction<string>) {
      state.filter = action.payload;
    },
    setSelectedCompany(state, action: PayloadAction<Company | undefined>) {
      state.selectedCompanyId = action.payload?.id;
    },
    clearSelection(state) {
      state.selectedCompanyId = undefined;
    },
  }
});

export const companyListReducer = companyListSlice.reducer;
export const { addNewCompany, clearSelection, setSelectedCompany, setFilter } = companyListSlice.actions;
