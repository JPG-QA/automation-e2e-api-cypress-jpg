const SELECTORS = require('../selectors/loginSelectors');

class LoginPage {
  visit() {
    cy.visit('/', { timeout: 120000, failOnStatusCode: false });
    cy.get(SELECTORS.username, { timeout: 120000 }).should('be.visible');
  }

  login(username, password) {
    cy.get(SELECTORS.username).clear();
    if (username) {
      cy.get(SELECTORS.username).type(username);
    }

    cy.get(SELECTORS.password).clear();
    if (password) {
      cy.get(SELECTORS.password).type(password);
    }

    cy.get(SELECTORS.loginButton).click();
  }

  assertLoggedIn() {
    cy.url().should('include', '/inventory.html');
    cy.get('.inventory_container').should('be.visible');
  }

  assertLoginError(message) {
    cy.get('[data-test="error"]').should('be.visible').and('contain.text', message);
  }
}

module.exports = LoginPage;
