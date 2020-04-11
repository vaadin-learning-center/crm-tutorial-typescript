package com.vaadin.tutorial.crm.ui;

import com.vaadin.flow.component.page.AppShellConfigurator;
import com.vaadin.flow.server.PWA;


@PWA(name = "Vaadin CRM",
     shortName = "CRM",
     offlineResources = {
        "./styles/offline.css",
        "./images/offline.png"
     },
     enableInstallPrompt = false
)
public class AppShell implements AppShellConfigurator {
}
