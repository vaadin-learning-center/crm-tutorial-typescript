package com.vaadin.tutorial.crm.backend.controller;

import com.vaadin.tutorial.crm.backend.service.ContactService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class ContactController {

  private final ContactService contactService;

  public ContactController(ContactService contactService) {
    this.contactService = contactService;
  }

  @GetMapping("/contacts")
  public ResponseEntity<Object> getContacts(@RequestParam(required=false, value="filter") String filter) {
    return new ResponseEntity<>(contactService.findAll(filter), HttpStatus.OK);
  }
}
