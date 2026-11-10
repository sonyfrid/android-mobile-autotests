const { CatalogPage } = require('../pages/CatalogPage');
const { ProductPage } = require('../pages/ProductPage');
const { CartPage } = require('../pages/CartPage');
const { LoginPage } = require('../pages/LoginPage');
const { CheckoutPage } = require('../pages/CheckoutPage');
const { users, address, payment } = require('../support/data');

describe('Оформление заказа (E2E)', () => {
  beforeEach(async () => {
    await CatalogPage.waitLoaded();
    await CatalogPage.openProduct(0);
    await ProductPage.waitLoaded();
    await ProductPage.addToCart.click();
    await ProductPage.openCart();
    await CartPage.checkoutButton.click();
  });

  it('@smoke гость: вход → адрес → оплата → проверка → заказ оформлен, корзина пуста', async () => {
    // без входа оформление ведёт на экран логина
    await LoginPage.waitLoaded();
    await LoginPage.login(users.standard.username, users.standard.password);

    await CheckoutPage.fillAddress(address);
    await CheckoutPage.fillPayment(payment);

    await CheckoutPage.placeOrder.waitForExist({ timeout: 20000 });
    await expect($(`android=new UiSelector().textContains("${address.fullName}")`)).toExist();
    await CheckoutPage.tap(await CheckoutPage.placeOrder);

    await expect(CheckoutPage.completeTitle).toBeDisplayed();
    await CheckoutPage.continueShopping.click();
    await CatalogPage.waitLoaded();
    expect(await CatalogPage.cartCount()).toBe(0);
  });

  it('адрес: без обязательных полей дальше не пускает', async () => {
    await LoginPage.waitLoaded();
    await LoginPage.login(users.standard.username, users.standard.password);
    await CheckoutPage.toPayment.waitForExist({ timeout: 20000 });
    await CheckoutPage.tap(await CheckoutPage.toPayment);
    // остались на экране адреса, видна ошибка у полного имени
    await expect(CheckoutPage.toPayment).toExist();
    await expect(CheckoutPage.field('fullNameErrorTV')).toBeDisplayed();
    await expect(CheckoutPage.reviewOrder).not.toExist();
  });
});
