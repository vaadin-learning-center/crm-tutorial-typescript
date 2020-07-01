package com.vaadin.tutorial.crm.backend.service.endpoint;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.stream.Collectors;

import com.vaadin.flow.server.connect.Endpoint;
import com.vaadin.flow.server.connect.auth.AnonymousAllowed;
import com.vaadin.tutorial.crm.backend.entity.Contact.Status;
import com.vaadin.tutorial.crm.backend.service.CompanyService;
import com.vaadin.tutorial.crm.backend.service.ContactService;

import org.springframework.stereotype.Service;

@Endpoint
@Service
@AnonymousAllowed
public class ServiceEndpoint {

  private final ContactService contactService;
  private final CompanyService companyService;

  public ServiceEndpoint(ContactService contactService, CompanyService companyService) {
    this.contactService = contactService;
    this.companyService = companyService;
  }

  public List<Contact> find(String filter) {
    return contactService.findAll(filter).stream().map(Contact::new).collect(Collectors.toList());
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
      companyService.findById(contact.getCompany().getId()).ifPresent(c -> {
        dbContact.setCompany(c);
      });
    }

    contactService.save(dbContact);
  }

  public void deleteContact(Contact contact) {
    contactService.find(contact.getId()).ifPresent(dbContact -> contactService.delete(dbContact));

  }

  public List<Company> findAllCompanies() {
    return companyService.findAll().stream().map(Company::new).collect(Collectors.toList());
  }

  public HashMap<String, Object> getStats() {
    HashMap<String, Object> stats = new HashMap<String, Object>();
    stats.put("contacts", contactService.count());
    stats.put("companyStats", companyService.getStats());

    return stats;
  }
}
