import { css, customElement, html, LitElement, property } from 'lit-element';

import '@vaadin/vaadin-charts';
import { getStats } from '../../generated/ServiceEndpoint';
import {Lumo} from "../../styles/lumo";

@customElement('dashboard-view')
export class DashboardView extends LitElement {
  @property()
  private numberOfContacts = 0;

  @property()
  private chartValues: any = [];

  static styles = [
    Lumo,
    css`:host {
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .contact-stats {
      font-size: 4em;
      margin: 1em 0;
    }`
  ];

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

  async firstUpdated() {
    const stats = await getStats();
    this.numberOfContacts = stats.contacts;
    this.chartValues = Object.entries(stats.companyStats);
  }
}
