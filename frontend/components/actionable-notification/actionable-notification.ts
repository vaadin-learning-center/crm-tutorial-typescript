import {NotificationElement} from '@vaadin/vaadin-notification';
import '@vaadin/vaadin-button';
import {html, render} from 'lit-html';

/**
 * Theme variant choices for notification
 */
export const enum NotificationThemeVariant {
  DEFAULT = '',
  CONTRAST = 'contrast',
  PRIMARY = 'primary',
  SUCCESS = 'success',
  ERROR = 'error'
}

/**
 * Helper wrapper for <vaadin-notification> component, provides a handy async
 * trigger method.
 */
export class ActionableNotificationElement extends NotificationElement {
  private message = '';
  private actions: Array<string> = [];
  private primaryAction = '';
  private currentAction = '';

  constructor() {
    super();

    const actionHandler = (event: MouseEvent) => {
      event.preventDefault();
      this.currentAction = (event.target as any).notificationAction as string;
      this.opened = false;
    };

    this.renderer = (root => {
      render(html`
        ${this.message}
        ${this.actions.reverse().map(action => html`
          <vaadin-button
           theme="${action == this.primaryAction ? 'primary' : ''}"
           .notificationAction="${action}"
           @click="${actionHandler}">
            ${action}
          </vaadin-button>
        `)}
      `, root);
    });
  }

  /**
   * Show a notification and asynchronously get the user’s choice.
   *
   * @param themeVariant the notification theme variant
   * @param message the content of notification
   * @param actions if notification presents a choice for the user, the array of
   * strings to present with buttons in notification, where the first item is
   * the default action
   * @param duration the timeout before notification is hidden
   * @return Promise with an action string chosen by the user, or empty
   * string if closed after timeout
   */
  async trigger<A extends string>(
    themeVariant: NotificationThemeVariant,
    message: string,
    actions?: [...A[]],
    duration: number = 4000): Promise<A | ''> {
    this.setAttribute('theme', themeVariant);
    this.message = message;
    this.actions = actions !== undefined ? actions : [];
    this.primaryAction = actions !== undefined ? actions[0] : '';
    this.duration = duration;
    this.currentAction = '';
    return new Promise(resolve => {
      this.opened = true;
      this.render();
      this.addEventListener(
        'opened-changed',
        (() => resolve(this.currentAction as A)),
        {once: true}
      );
    });
  }
}

customElements.define('actionable-notification', ActionableNotificationElement);