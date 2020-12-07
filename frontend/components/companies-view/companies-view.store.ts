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

export const filteredCompaniesSelector = createSelector(
  (state: CompaniesViewRootState) => state.entities.companies,
  (state: CompaniesViewRootState) => state.companyList.filter,
  (companies, filter) => {
    const lowercaseFilter = filter.toLowerCase();
    return companies.filter(c =>
      c.name.toLowerCase().includes(lowercaseFilter));
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
