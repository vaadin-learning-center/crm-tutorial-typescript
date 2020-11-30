import { makeAutoObservable } from 'mobx';
import type { RootStore } from '../../stores';

import Company from '../../generated/com/vaadin/tutorial/crm/backend/entity/Company';
import CompanyModel from '../../generated/com/vaadin/tutorial/crm/backend/entity/CompanyModel';

export class CompanyListStore {
  root: RootStore;
  selectedCompanyId?: Company['id'] = undefined;
  filter: string = '';

  constructor(root: RootStore) {
    makeAutoObservable(this);
    this.root = root;
  }

  get filteredCompanies() {
    const filter = this.filter.toLowerCase();
    return this.root.entities.companies.filter(c =>
      c.name.toLowerCase().includes(filter));
  }

  get selectedCompany() {
    return this.selectedCompanyId === 0
      ? CompanyModel.createEmptyValue()
      : this.root.entities.companies.find(c => c.id === this.selectedCompanyId);
  }

  addNewCompany() {
    this.selectedCompanyId = 0;
  }

  async saveCompany(company: Company) {
    this.clearSelection();
    await this.root.entities.saveCompany(company);
  }

  async deleteCompany(company: Company) {
    this.clearSelection();
    await this.root.entities.deleteCompany(company);
  }

  setFilter(filter: string) {
    this.filter = filter;
  }

  setSelectedCompany(company?: Company) {
    this.selectedCompanyId = company?.id;
  }

  clearSelection() {
    this.selectedCompanyId = undefined;
  }
}
