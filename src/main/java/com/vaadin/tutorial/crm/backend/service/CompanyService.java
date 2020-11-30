package com.vaadin.tutorial.crm.backend.service;

import java.util.List;
import java.util.Optional;

import com.vaadin.tutorial.crm.backend.entity.Company;
import com.vaadin.tutorial.crm.backend.repository.CompanyRepository;

import org.springframework.stereotype.Service;

@Service
public class CompanyService {

  private CompanyRepository companyRepository;

  public CompanyService(CompanyRepository companyRepository) {
    this.companyRepository = companyRepository;
  }

  public List<Company> findAll() {
    return companyRepository.findAll();
  }

  public Optional<Company> findById(Long id) {
    return companyRepository.findById(id);
  }
}
