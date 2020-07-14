/*
  Ideally, this file won't be needed and `@vaadin/vaadin-lumo-styles` would be used directly.

  Intended use:
   1. [in index.ts] import for side effects to apply the Lumo theme to the <html> element
      This applies the Lumo theme to the light DOM of the app globally.

      import './styles/lumo';

   2. [in my-view.ts] import the `Lumo` css literal to use the Lumo theme inside LitElement-based custom elements
      This applies the Lumo theme to the shadow DOM of a custom element.

      import {Lumo} from '../styles/lumo';

      @customElement('my-view')
      export class MyView extends LitElement {
        static styles = [
          Lumo,
          css`
            view styles
          `
        ];
        ...
      }

  These two use cases could possibly be split into two imports.


  This file is different from '@vaadin/vaadin-lumo-styles/all-imports' in two ways:
   1. This file does not eagerly create _all_ global Lumo style modules, unlike `all-imports`.
      Global style modules are useless in LitElement-based apps.
   2. This file exports Lumo styles in a way that's usable in LitElement-based apps.
   3. This file does not eagerly register the Vaadin icons
      Every view that uses Vaadin icons `<iron-icon icon="vaadin:[icon name]"></iron-icon>` would be responsible for
      importing them.

  This is the same as '@vaadin/vaadin-lumo-styles/all-imports' in:
   1. Both files have a side effect of appending the Lumo theme styles to the <html> element


  == More details:

  Files listed in `all-imports` (e.g. `@vaadin/vaadin-lumo-styles/typography`) have side effects and no explicit
  exports. Each of them eagerly creates (one or several) global style modules in the <head> (i.e. a couple of
  <dom-module id="lumo-[module name]"> elements).

  AFAIK historically there may have been a reason to do create global style modules eagerly, but not anymore.

    - There is no reason to create global style modules unless the app defines own custom elements based on
      PolymerElement, and uses these style modules there. Moreover, there is no reason to create global style modules
      eagerly before they are actually needed. Using Polymer-based Vaadin components is not a reason either, because
      each Vaadin component imports the Lumo style modules it needs.

    - When using Bower / Polymer CLI and HTML imports, in some circumstances the order of imports was not guaranteed.
      That interfered with the Vaadin Themable mixin.

  At the moment `@vaadin/vaadin-lumo-styles` does not have any way to access the Lumo styles other than through global
  style modules. This is not convenient in LitElement-based apps. When using Lumo styles in a LitElement-based custom
  element, I need a css literal that can be used in the LitElement's `styles` static property.

  For convenience, this file does that needed transformations and exports the result that's ready to use in a
  LitElement.
*/

import '@vaadin/vaadin-lumo-styles/color';
import '@vaadin/vaadin-lumo-styles/font-icons';
import '@vaadin/vaadin-lumo-styles/sizing';
import '@vaadin/vaadin-lumo-styles/spacing';
import '@vaadin/vaadin-lumo-styles/style';
import '@vaadin/vaadin-lumo-styles/typography';

// Intentionally excluded (import in the views that do use Vaadin icons)
// Ideally, it should be possible to import individual icons. The full set is hu-u-uge and is usually excessive.
// import '@vaadin/vaadin-lumo-styles/icons';

import { DomModule } from '@polymer/polymer/lib/elements/dom-module';
import { stylesFromTemplate } from '@polymer/polymer/lib/utils/style-gather';
import { CSSResult, unsafeCSS } from 'lit-element';

/**
 * Utility function for importing style modules. This is a temporary
 * solution until there is a standard solution available
 * @see https://github.com/vaadin/vaadin-themable-mixin/issues/73
 *
 * @param id the style module to import
 */
function CSSModule(id: string): CSSResult {
  const template: HTMLTemplateElement | null = DomModule.import(id, 'template') as HTMLTemplateElement;
  const cssText =
    template &&
    stylesFromTemplate(template, '')
      .map((style: HTMLStyleElement) => style.textContent)
      .join(' ');
  return unsafeCSS(cssText);
}

export const Lumo = unsafeCSS(
  CSSModule('lumo-typography').cssText + ' ' + CSSModule('lumo-color')
);
