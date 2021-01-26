package com.vaadin.tutorial.crm.ui.views.authinfo;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;

import com.vaadin.flow.component.html.H4;
import com.vaadin.flow.component.html.Span;
import com.vaadin.flow.component.orderedlayout.VerticalLayout;
import com.vaadin.flow.router.PageTitle;
import com.vaadin.flow.router.Route;

@PageTitle("Auth Info (Flow)")
@Route(value = "auth-info-flow")
public class AuthInfoView extends VerticalLayout {

    public AuthInfoView() {

        Authentication authentication = SecurityContextHolder.getContext()
                .getAuthentication();
        Object principal = authentication.getPrincipal();

        if (principal instanceof Jwt) {
            Jwt jwtPrincipal = (Jwt) principal;
            add(new H4("JWT Security Principal"));
            add(new Span("id: " + jwtPrincipal.getId()));
            add(new Span("subject: " + jwtPrincipal.getSubject()));
        } else {
            add(new H4("Unknown Security Principal"));
            add(principal.toString());
        }

        add(new H4("Granted Authorities"));
        authentication.getAuthorities().forEach(authority -> add(
                new Span("grantedAuthority: " + authority.toString())));
    }
}
