import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from './index';

export type PieChartSeriesValue = [ string, number ];
export type PieChartSeriesValues = PieChartSeriesValue[];

export const chartValuesSelector = createSelector(
  (state: RootState) => state.contacts.contacts,
  contacts => {
    return Object.entries(
      contacts.map(contact => contact.company?.name || 'no company')
        .reduce((counts, companyName) => {
          counts[companyName] = (counts[companyName] || 0) + 1;
          return counts;
        }, {} as { [k in string]: number })
    ) as PieChartSeriesValues;
  }
);
