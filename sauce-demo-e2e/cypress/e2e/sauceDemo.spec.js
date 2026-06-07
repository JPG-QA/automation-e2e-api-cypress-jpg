const LoginPage = require('../pages/loginPage');
const InventoryPage = require('../pages/inventoryPage');
const CartPage = require('../pages/cartPage');
const CheckoutPage = require('../pages/checkoutPage');
const CheckoutOverviewPage = require('../pages/checkoutOverviewPage');
const credentials = require('../fixtures/credentials.json');
const purchaseData = require('../fixtures/purchaseData.json');

const { USERNAME, PASSWORD, LOCKED_USER } = credentials;
const { products, customer } = purchaseData;

describe('Sauce Demo E2E - Flujo de compra completo', () => {
  const loginPage = new LoginPage();
  const inventoryPage = new InventoryPage();
  const cartPage = new CartPage();
  const checkoutPage = new CheckoutPage();
  const checkoutOverviewPage = new CheckoutOverviewPage();

  it('Debería mostrar error al intentar iniciar sesión con usuario bloqueado', () => {
    loginPage.visit();
    loginPage.login(LOCKED_USER, PASSWORD);
    loginPage.assertLoginError('Sorry, this user has been locked out');
  });

  it('Debería iniciar sesión y completar la compra hasta la confirmación', () => {
    loginPage.visit();
    loginPage.login(USERNAME, PASSWORD);
    loginPage.assertLoggedIn();

    inventoryPage.assertHasProducts(products.length);
    inventoryPage.addProductToCart(products[0]);
    inventoryPage.addProductToCart(products[1]);
    cartPage.assertCartBadge(products.length);
    inventoryPage.goToCart();
    cartPage.assertCartItemCount(products.length);

    cartPage.proceedToCheckout();
    checkoutPage.assertOnStepOne();
    checkoutPage.fillCustomerInformation(customer.firstName, customer.lastName, customer.postalCode);
    checkoutPage.continue();

    checkoutOverviewPage.assertOnStepTwo();
    checkoutOverviewPage.assertItemsAndTotal(products.length);
    checkoutOverviewPage.finishOrder();
    checkoutOverviewPage.assertOrderComplete();
  });
});
