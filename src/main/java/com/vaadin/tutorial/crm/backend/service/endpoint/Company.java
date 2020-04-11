package com.vaadin.tutorial.crm.backend.service.endpoint;

import java.util.LinkedList;
import java.util.List;

public class Company {
  private Long id;

  private String name;
  private List<Contact> employees = new LinkedList<>();

  public Company() {
  }

  public Company(com.vaadin.tutorial.crm.backend.entity.Company dbCompany) {
    name = dbCompany.getName();
    id = dbCompany.getId();
    // employees =
    // dbCompany.getEmployees().stream().map(Contact::new).collect(Collectors.toList());
  }

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public Company(String name) {
    setName(name);
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public List<Contact> getEmployees() {
    return employees;
  }
}
