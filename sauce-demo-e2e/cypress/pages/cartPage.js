class CartPage {
  assertCartItemCount(expectedCount) {
    cy.get('.cart_item').should('have.length', expectedCount);
  }

  assertCartBadge(expectedCount) {
    cy.get('.shopping_cart_badge').should('have.text', String(expectedCount));
  }

  removeItem(productSlug) {
    cy.get(`[data-test="remove-${productSlug}"]`).click();
  }

  proceedToCheckout() {
    cy.get('[data-test="checkout"]').click();
  }
}

module.exports = CartPage;
