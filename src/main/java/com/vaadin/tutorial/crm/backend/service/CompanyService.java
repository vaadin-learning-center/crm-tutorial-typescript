package com.vaadin.tutorial.crm.backend.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
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

  public Map<String, Integer> getStats() {
    HashMap<String, Integer> stats = new HashMap<>();
    findAll().forEach(company -> stats.put(company.getName(), company.getEmployees().size()));
    return stats;
  }

  public Optional<Company> findById(Long id) {
    return companyRepository.findById(id);
  }
}
