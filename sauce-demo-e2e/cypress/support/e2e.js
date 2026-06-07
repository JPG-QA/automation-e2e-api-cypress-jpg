beforeEach(() => {
  cy.intercept(/backtrace\.io/, { statusCode: 200, body: '' });
});
