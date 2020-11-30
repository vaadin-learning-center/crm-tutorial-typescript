import { customElement, html } from 'lit-element';
import { MobxLitElement } from '@adobe/lit-mobx';
import '@vaadin/vaadin-charts';
import { Lumo } from '../../utils/lumo';
import styles from './dashboard-view.css';
import { rootStore } from '../../stores';
import { DashboardStore } from './dashboard-store';

const state = new DashboardStore(rootStore);

@customElement('dashboard-view')
export class DashboardView extends MobxLitElement {

  static styles = [Lumo, styles];

  render() {
    return html`
      <span class="contact-stats">
        ${state.contactCount} contacts
      </span>

      <vaadin-chart type="pie">
        <vaadin-chart-series .values=${state.contactCountByCompanyName}>
        </vaadin-chart-series>
      </vaadin-chart>
    `;
  }
}
