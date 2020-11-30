import { html, render } from 'lit-html';
import '@vaadin/vaadin-grid/vaadin-grid-filter';
import '@vaadin/vaadin-grid/vaadin-grid-sorter';
import type { GridHeaderFooterRenderer } from '@vaadin/vaadin-grid';

export const sortAndFilterGridHeaderRenderer: GridHeaderFooterRenderer = (root, column) => {
  render(html`
      <vaadin-grid-sorter path="${column?.path}">${column?.header}</vaadin-grid-sorter><br>
      <vaadin-grid-filter path="${column?.path}"></vaadin-grid-filter>
    `, root);
}
