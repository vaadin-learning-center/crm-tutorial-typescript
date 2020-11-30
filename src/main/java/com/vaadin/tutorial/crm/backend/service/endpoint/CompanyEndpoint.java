package com.vaadin.tutorial.crm.backend.service.endpoint;

import java.util.List;

import org.springframework.stereotype.Service;

import com.vaadin.flow.server.connect.Endpoint;
import com.vaadin.tutorial.crm.backend.entity.Company;
import com.vaadin.tutorial.crm.backend.service.CompanyService;

@Endpoint
@Service
public class CompanyEndpoint {

  private final CompanyService companyService;

  public CompanyEndpoint(CompanyService companyService) {
    this.companyService = companyService;
  }

  public Company.State[] getCompanyStates() {
    return Company.State.values();
  }

  public void saveCompany(Company company) {
    Company dbContact = companyService.findById(company.getId())
        .orElse(new Company());

    dbContact.setName (company.getName());
    dbContact.setDescription(company.getDescription());
    dbContact.setState(company.getState());

    companyService.save(dbContact);
  }

  public void deleteCompany(Company company) {
    companyService.findById(company.getId()).ifPresent(companyService::delete);

  }

  public List<Company> findAllCompanies() {
    return companyService.findAll();
  }

}
