package com.vaadin.tutorial.crm.backend.service.endpoint;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.vaadin.flow.server.connect.Endpoint;
import com.vaadin.flow.server.connect.auth.AnonymousAllowed;
import com.vaadin.tutorial.crm.backend.entity.Company;
import com.vaadin.tutorial.crm.backend.entity.Contact;
import com.vaadin.tutorial.crm.backend.entity.Contact.Status;
import com.vaadin.tutorial.crm.backend.service.CompanyService;
import com.vaadin.tutorial.crm.backend.service.ContactService;

import org.springframework.stereotype.Service;

@Endpoint
@Service
public class ServiceEndpoint {

  private final ContactService contactService;
  private final CompanyService companyService;

  public ServiceEndpoint(ContactService contactService, CompanyService companyService) {
    this.contactService = contactService;
    this.companyService = companyService;
  }

  public List<Contact> find(String filter) {
    return contactService.findAll(filter);
  }

  public Status[] getContactStatuses() {
    return Status.values();
  }

  public void saveContact(Contact contact) {
    com.vaadin.tutorial.crm.backend.entity.Contact dbContact = contactService.find(contact.getId())
        .orElse(new com.vaadin.tutorial.crm.backend.entity.Contact());

    dbContact.setFirstName(contact.getFirstName());
    dbContact.setLastName(contact.getLastName());
    dbContact.setEmail(contact.getEmail());
    dbContact.setStatus(contact.getStatus());

    if (dbContact.getCompany() == null || !contact.getCompany().getId().equals(dbContact.getCompany().getId())) {
      companyService.findById(contact.getCompany().getId()).ifPresent(dbContact::setCompany);
    }

    contactService.save(dbContact);
  }

  public void deleteContact(Contact contact) {
    contactService.find(contact.getId()).ifPresent(contactService::delete);

  }

  public List<Company> findAllCompanies() {
    return companyService.findAll();
  }

  public Map<String, Object> getStats() {
    Map<String, Object> stats = new HashMap<>();
    stats.put("contacts", contactService.count());
    stats.put("companyStats", companyService.getStats());

    return stats;
  }
}
