import { customElement, html, LitElement } from 'lit-element';
import '@vaadin/vaadin-app-layout/theme/lumo/vaadin-app-layout';
import '@vaadin/vaadin-app-layout/theme/lumo/vaadin-drawer-toggle';
import { applyTheme } from 'Frontend/generated/theme';
import styles from './main-layout-styles.css';

@customElement('main-layout')
export class MainLayout extends LitElement {
  static styles = [styles];

  render() {
    return html`
      <vaadin-app-layout id="layout">
        <vaadin-drawer-toggle slot="navbar"></vaadin-drawer-toggle>
        <div slot="navbar" class="header">
          <h1 class="logo">Vaadin CRM</h1>
          <a href="/logout">Log out</a>
        </div>
        <div slot="drawer" class="drawer">
          <ul>
            <li><a href="/">List</a></li>
            <li><a href="/dashboard">Dashboard</a></li>
          </ul>
        </div>
        <slot></slot>
      </vaadin-app-layout>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    applyTheme(this.shadowRoot!);
  }
}
