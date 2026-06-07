class CheckoutPage {
  assertOnStepOne() {
    cy.url().should('include', '/checkout-step-one.html');
  }

  fillCustomerInformation(firstName, lastName, postalCode) {
    cy.get('[data-test="firstName"]').type(firstName);
    cy.get('[data-test="lastName"]').type(lastName);
    cy.get('[data-test="postalCode"]').type(postalCode);
  }

  continue() {
    cy.get('[data-test="continue"]').click();
  }
}

module.exports = CheckoutPage;
