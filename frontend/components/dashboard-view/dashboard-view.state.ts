import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../../store';
import { selectAllCompanies } from '../../store/entities';

export type PieChartSeriesValue = [ string, number ];
export type PieChartSeriesValues = PieChartSeriesValue[];

export const numberOfContactsSelector = createSelector(
  (state: RootState) => selectAllCompanies(state.entities.companies),
  companies => {
    return companies.reduce(
      (count, company) => count + (company.employees?.length || 0),
      0);
  }
);

export const chartValuesSelector = createSelector(
  (state: RootState) => selectAllCompanies(state.entities.companies),
  companies => {
    return Object.entries(
      companies.filter(company => company.employees && company.employees.length > 0)
        .reduce((counts, company) => {
          counts[company.name] = (counts[company.name] || 0) + 1;
          return counts;
        }, {} as { [k in string]: number })
    ) as PieChartSeriesValues;
  }
);
