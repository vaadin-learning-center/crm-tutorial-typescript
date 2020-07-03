package com.vaadin.tutorial.crm.backend.service.endpoint;

import com.vaadin.tutorial.crm.backend.entity.Contact.Status;

public class Contact {

  public Contact() {
  }

  public Contact(com.vaadin.tutorial.crm.backend.entity.Contact dbContact) {
    id = dbContact.getId();
    firstName = dbContact.getFirstName();
    lastName = dbContact.getLastName();
    company = new Company(dbContact.getCompany());
    status = dbContact.getStatus();
    email = dbContact.getEmail();
  }

  private Long id;

  private String firstName = "";

  private String lastName = "";

  private Company company;

  private Status status;

  private String email = "";

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public String getEmail() {
    return email;
  }

  public void setEmail(String email) {
    this.email = email;
  }

  public Status getStatus() {
    return status;
  }

  public void setStatus(Status status) {
    this.status = status;
  }

  public String getLastName() {
    return lastName;
  }

  public void setLastName(String lastName) {
    this.lastName = lastName;
  }

  public String getFirstName() {
    return firstName;
  }

  public void setFirstName(String firstName) {
    this.firstName = firstName;
  }

  public void setCompany(Company company) {
    this.company = company;
  }

  public Company getCompany() {
    return company;
  }

}
