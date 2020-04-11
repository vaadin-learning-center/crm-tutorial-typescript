package com.vaadin.tutorial.crm.backend.service.endpoint;

public class Contact {

  public Contact() {
  }

  public Contact(com.vaadin.tutorial.crm.backend.entity.Contact dbContact) {
    id = dbContact.getId();
    firstName = dbContact.getFirstName();
    lastName = dbContact.getLastName();
    company = new Company(dbContact.getCompany());
    status = dbContact.getStatus().toString();
    email = dbContact.getEmail();
  }

  private Long id;

  private String firstName = "";

  private String lastName = "";

  private Company company;

  private String status;

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

  public String getStatus() {
    return status;
  }

  public void setStatus(String status) {
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
