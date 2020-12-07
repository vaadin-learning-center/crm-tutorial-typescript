import { customElement, html, LitElement, property } from 'lit-element';
import { connect } from 'pwa-helpers';

import '@vaadin/vaadin-charts';
import { initContacts } from '../../store/contacts';
import { chartValuesSelector } from '../../store/dashboard';
import { Lumo } from '../../utils/lumo';
import styles from './dashboard-view.css';

import type { RootState } from '../../store';
import type { PieChartSeriesValues } from '../../store/dashboard';
import { store } from '../../store';

@customElement('dashboard-view')
export class DashboardView extends connect(store)(LitElement) {
  @property()
  private numberOfContacts = 0;

  @property()
  private chartValues: PieChartSeriesValues = [];

  stateChanged(state: RootState) {
    this.numberOfContacts = state.contacts.contacts.length;
    this.chartValues = chartValuesSelector(state);
  }

  static styles = [Lumo, styles];

  connectedCallback() {
    super.connectedCallback();
    store.dispatch(initContacts(null));
  }

  render() {
    return html`
      <span class="contact-stats">
        ${this.numberOfContacts} contacts
      </span>

      <vaadin-chart type="pie">
        <vaadin-chart-series .values=${this.chartValues}></vaadin-chart-series>
      </vaadin-chart>
    `;
  }
}
