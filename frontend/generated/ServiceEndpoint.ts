/**
 * This module is generated from ServiceEndpoint.java
 * All changes to this file are overridden. Please consider to make changes in the corresponding Java file if necessary.
 * @see {@link file:///Users/mhellber/Desktop/vaadin-crm/src/main/java/com/vaadin/tutorial/crm/backend/service/endpoint/ServiceEndpoint.java}
 * @module ServiceEndpoint
 */

// @ts-ignore
import client from './connect-client.default';
import Company from './com/vaadin/tutorial/crm/backend/service/endpoint/Company';
import Contact from './com/vaadin/tutorial/crm/backend/service/endpoint/Contact';

function _deleteContact(
  contact: Contact
): Promise<void> {
  return client.call('ServiceEndpoint', 'deleteContact', {contact});
}
export {_deleteContact as deleteContact};

function _findAllCompanies(): Promise<Array<Company>> {
  return client.call('ServiceEndpoint', 'findAllCompanies');
}
export {_findAllCompanies as findAllCompanies};

function _find(
  filter: string
): Promise<Array<Contact>> {
  return client.call('ServiceEndpoint', 'find', {filter});
}
export {_find as find};

function _getContactStatuses(): Promise<Array<string>> {
  return client.call('ServiceEndpoint', 'getContactStatuses');
}
export {_getContactStatuses as getContactStatuses};

function _getStats(): Promise<{ [key: string]: any; }> {
  return client.call('ServiceEndpoint', 'getStats');
}
export {_getStats as getStats};

function _saveContact(
  contact: Contact
): Promise<void> {
  return client.call('ServiceEndpoint', 'saveContact', {contact});
}
export {_saveContact as saveContact};
