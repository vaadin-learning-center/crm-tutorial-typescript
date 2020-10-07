import {
  ActionableNotificationElement,
  NotificationThemeVariant,
} from '../components/actionable-notification/actionable-notification';

import {
  EndpointRequest,
  OnDeferredCallCallback
} from '@vaadin/flow-frontend/Connect';

// Notification instance for deferred calls
const offlineCallNotification = new ActionableNotificationElement();
document.body.appendChild(offlineCallNotification);

export const deferredCallCallback: OnDeferredCallCallback =
  async (call: EndpointRequest, promiseResult: Promise<any>) => {
    console.debug(`Processing deferred call for ${call.endpoint}#${call.method}`);
    try {
      await promiseResult;
      await offlineCallNotification.trigger(
        NotificationThemeVariant.SUCCESS,
        'Offline data is sent successfully'
      );
    } catch (error) {
      await offlineCallNotification.trigger(
        NotificationThemeVariant.ERROR,
        'Error when sending offline data'
      );

      // Re-throw the error to keep the deferred call in the queue
      // throw error;
    }
  };
