import Contact from './Contact';

/**
 * This module is generated from com.vaadin.tutorial.crm.backend.service.endpoint.Company.
 * All changes to this file are overridden. Please consider to make changes in the corresponding Java file if necessary.
 * @see {@link file:///Users/mhellber/Desktop/vaadin-crm/src/main/java/com/vaadin/tutorial/crm/backend/service/endpoint/Company.java}
 */
export default interface Company {
  employees: Array<Contact>;
  id: number;
  name: string;
}
