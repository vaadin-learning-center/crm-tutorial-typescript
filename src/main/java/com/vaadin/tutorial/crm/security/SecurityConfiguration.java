package com.vaadin.tutorial.crm.security;

import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;

@EnableWebSecurity
@Configuration
public class SecurityConfiguration extends WebSecurityConfigurerAdapter {

  @Override
  protected void configure(HttpSecurity http) throws Exception {
    // ignore csrf for login processing url and Vaadin endpoint requests
    http.csrf().ignoringAntMatchers("/login", "/connect/**");

    // Vaadin renders a client-side login page at "/login" (see the routes
    // config in index.ts).

    // Okta automatically configures the JWT resource server
    // It's unnecessary to explicitly add it here unless there is a need for custom config
    //    http.oauth2ResourceServer()
    //            .jwt();

    // DONE: disable OAuth2AuthorizationRequestRedirectFilter and OAuth2LoginAuthenticationFilter
    // Done by removing the `okta.oauth2.clientId property from application.properties.
    // See  com.okta.spring.boot.oauth.OktaOAuth2Configurer#init()
    // See  org.springframework.security.config.annotation.web.configurers.oauth2.client.OAuth2ClientConfigurer

    // DONE: disable Spring DefaultLoginPageGeneratingFilter
    // DONE: disable Spring DefaultLogoutPageGeneratingFilter
    // Done by removing the `okta.oauth2.clientId property from application.properties
    // and then not using any of
    //  - http.formLogin()
    //  - http.oauth2Client()
    //  - http.openidLogin()
    //  - http.saml2Login()
    // See org.springframework.security.web.authentication.ui.DefaultLoginPageGeneratingFilter#isEnabled()

    // Spring Security supports logout requests by default, so there is no need
    // to configure it separately. However, it's important that it's configured
    // because this app assumes the default `/logout` HTTP GET handler.
    // http.logout();
  }

//  Not needed because the user database is in Okta
//  @Override
//  protected void configure(AuthenticationManagerBuilder auth) throws Exception {
//    // Configure users and roles in memory
//    auth.inMemoryAuthentication().withUser("user").password("{noop}password").roles("USER");
//  }
}
