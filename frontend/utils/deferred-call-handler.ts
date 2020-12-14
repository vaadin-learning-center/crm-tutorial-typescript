import {
  ActionableNotificationElement,
  NotificationThemeVariant,
} from '../components/actionable-notification/actionable-notification';

import {
  DeferredCallHandler,
  DeferredCallSubmitter
} from '@vaadin/flow-frontend';

// Notification instance for deferred calls
const offlineCallNotification = new ActionableNotificationElement();
document.body.appendChild(offlineCallNotification);

export const deferredCallHandler: DeferredCallHandler = {
  async handleDeferredCallSubmission(deferredCallSubmitter: DeferredCallSubmitter) {
    console.debug(`Processing deferred call`);
    try {
      // Submit the deferred call and wait for it to finish
      await deferredCallSubmitter.submit();
      // Notify the user of successful result
      await offlineCallNotification.trigger(
        NotificationThemeVariant.SUCCESS,
        'Offline data is sent successfully'
      );
    } catch (error) {
      // Notify the user of the error
      await offlineCallNotification.trigger(
        NotificationThemeVariant.ERROR,
        'Error when sending offline data'
      );
      // The call will be removed from the deferred queue
      // when sent successfully or if the error is handled here.
      // To keep the call in the queue, call the
      // keepDeferredCallInTheQueue() method.
      // deferredCallSubmitter.keepDeferredCallInTheQueue();
    }
  }
};
