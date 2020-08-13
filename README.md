<p align="center">
  <img src="https://user-images.githubusercontent.com/22416150/84907166-8bdb4f00-b0bb-11ea-8232-b7ebb836707d.png" width="196" alt="under construction">
</p>

# Vaadin CRM in TypeScript

Reference implementation of a Spring Boot + Vaadin web application.
The UI is built with reactive components using TypeScript and LitElement.
The backend is built with Java and Spring Boot.

This is a TypeScript-based version of the [Vaadin CRM](https://github.com/vaadin-learning-center/crm-tutorial) application which is used as an example in the [Building Modern Web Apps with Spring Boot and Vaadin](https://vaad.in/37pHRmY) tutorial series. 

See the [Vaadin FAQ](https://vaadin.com/faq) for more details on the difference between the Vaadin Java and TypeScript APIs.


## Key differences from [Vaadin CRM](https://github.com/vaadin-learning-center/crm-tutorial)

### Styling

#### How to use the Vaadin Lumo / Material theme in my app?

This project includes a helper file
[frontend/utils/lumo.ts](https://github.com/vaadin-learning-center/crm-tutorial-typescript/blob/master/frontend/utils/lumo.ts)
which is needed for importing Lumo styles into TypeScript views (see issue [#18](https://github.com/vaadin-learning-center/crm-tutorial-typescript/issues/18) for simplifying this in the future).
See the comments in the file for more info.

##### Applying the Lumo styles globally to the light DOM of the application

`frontend/index.ts`:
```ts
import './utils/lumo';
```

##### Applying styles into the shadow DOM of a LitElement based component/view

`frontend/components/list-view/list-view.ts`:
```ts
import { Lumo } from '../../utils/lumo';

@customElement('list-view')
export class ListView extends LitElement {
  // ...
  static styles = [Lumo];
  // ...
```

#### How to create styles for my view?

View and component styles are saved in a plain `.css` file next to the view/component `.ts`.

`frontend/components/list-view/list-view.css`:
```css
/* ... */
.toolbar {
  margin-bottom: var(--lumo-space-m);
}
/* ... */
```


`frontend/components/list-view/list-view.ts`:
```ts
import { Lumo } from '../../utils/lumo';
import styles from './list-view.css';

@customElement('list-view')
export class ListView extends LitElement {
  // ...
  static styles = [Lumo, styles];
  // ...
```

##### Writing styles directly in the `.ts` file of the view/component

It's also possible to write the styles directly in the `.ts` file if you don't want to create a separate CSS file for them.

`frontend/components/list-view/list-view.ts`:
```ts
// Make sure to import also `css` from 'lit-element'
import {css, customElement, html, LitElement, property} from 'lit-element';
import { Lumo } from '../../utils/lumo';

@customElement('list-view')
export class ListView extends LitElement {
  // ...
  static styles = [
    Lumo,
    css`
      .toolbar {
        margin-bottom: var(--lumo-space-m);
      }
    `
  ];
  // ...
```