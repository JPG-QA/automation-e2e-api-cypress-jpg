class CheckoutOverviewPage {
  assertOnStepTwo() {
    cy.url().should('include', '/checkout-step-two.html');
  }

  assertItemsAndTotal(expectedItemCount) {
    cy.get('.cart_item').should('have.length', expectedItemCount);
    cy.get('.summary_total_label').should('be.visible');
  }

  finishOrder() {
    cy.get('[data-test="finish"]').click();
  }

  assertOrderComplete() {
    cy.url().should('include', '/checkout-complete.html');
    cy.get('.complete-header').should('have.text', 'Thank you for your order!');
  }
}

module.exports = CheckoutOverviewPage;
