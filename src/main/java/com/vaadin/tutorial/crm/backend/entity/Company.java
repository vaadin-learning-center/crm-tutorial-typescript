package com.vaadin.tutorial.crm.backend.entity;

import javax.annotation.Nullable;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.OneToMany;
import java.util.LinkedList;
import java.util.List;

@Entity
public class Company extends AbstractEntity {
  private String name;

  @OneToMany(mappedBy = "company", fetch = FetchType.EAGER)
  @Nullable
  private List<Contact> employees = new LinkedList<>();

  public Company() {
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