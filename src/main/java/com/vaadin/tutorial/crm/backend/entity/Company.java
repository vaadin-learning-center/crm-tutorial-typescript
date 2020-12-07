package com.vaadin.tutorial.crm.backend.entity;

import javax.annotation.Nullable;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.FetchType;
import javax.persistence.OneToMany;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;
import java.util.LinkedList;
import java.util.List;

@Entity
public class Company extends AbstractEntity {

  public enum State {
    Unknown, Prospect, Customer, Churned
  }

  @NotNull
  @NotEmpty
  private String name;

  @Nullable
  private String description;

  @Enumerated(EnumType.STRING)
  @Nullable
  @NotNull
  private State state = State.Unknown;

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

  public String getDescription() {
    return description;
  }

  public void setDescription(String description) {
    this.description = description;
  }

  @Nullable
  public State getState() {
    return state;
  }

  public void setState(@Nullable State state) {
    this.state = state;
  }

  public void setEmployees(@Nullable List<Contact> employees) {
    this.employees = employees;
  }

  @Override
  public String toString() {
    return "Company{" +
            "name='" + name + '\'' +
            ", description='" + description + '\'' +
            ", state=" + state +
            ", employees=" + employees +
            '}';
  }
}