class InventoryPage {
  assertHasProducts(minCount = 2) {
    cy.get('.inventory_item').should('have.length.at.least', minCount);
  }

  addProductToCart(productSlug) {
    cy.get(`[data-test="add-to-cart-${productSlug}"]`).click();
  }

  goToCart() {
    cy.get('.shopping_cart_link').click();
  }
}

module.exports = InventoryPage;
