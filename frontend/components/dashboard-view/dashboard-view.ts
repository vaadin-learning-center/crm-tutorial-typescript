import { customElement, html, LitElement, property } from 'lit-element';

import '@vaadin/vaadin-charts';
import { getStats } from 'Frontend/generated/ServiceEndpoint';
import { applyTheme } from 'Frontend/generated/theme';
import styles from './dashboard-view.css';

@customElement('dashboard-view')
export class DashboardView extends LitElement {
  @property()
  private numberOfContacts = 0;

  @property()
  private chartValues: any = [];

  static styles = [styles];

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

  connectedCallback() {
    super.connectedCallback();
    applyTheme(this.shadowRoot!);
  }

  async firstUpdated() {
    const stats = await getStats();
    this.numberOfContacts = stats.contacts;
    this.chartValues = Object.entries(stats.companyStats);
  }
}
