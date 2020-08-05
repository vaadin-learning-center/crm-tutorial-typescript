package com.vaadin.tutorial.crm.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import javax.persistence.*;
import javax.validation.constraints.Email;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;

@Entity
public class Contact extends AbstractEntity implements Cloneable {

    public enum Status {
        ImportedLead, NotContacted, Contacted, Customer, ClosedLost
    }

    @NotEmpty
    private String firstName = "";

    @NotEmpty
    private String lastName = "";

    @ManyToOne
    @JoinColumn(name = "company_id")
    @JsonIgnoreProperties("employees")
    @NotNull
    private Company company;

    @Enumerated(EnumType.STRING)
    @NotNull
    private Contact.Status status;

    @Email
    @NotEmpty
    private String email = "";

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

    @Override
    public String toString() {
        return firstName + " " + lastName;
    }

}
