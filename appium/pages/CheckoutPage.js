const { BasePage } = require('./BasePage');
const { id, desc, text, price } = require('../support/app');

// Оформление: адрес → оплата → проверка заказа → готово
class CheckoutPage extends BasePage {
  get toPayment() { return $(desc('Saves user info for checkout')); }
  get reviewOrder() { return $(desc('Saves payment info and launches screen to review checkout data')); }
  get placeOrder() { return $(desc('Completes the process of checkout')); }
  get completeTitle() { return $(text('Checkout Complete')); }
  get continueShopping() { return $(desc('Tap to open catalog')); }
  get totalAmount() { return $(id('totalAmountTV')); }

  field(name) { return $(id(name)); }

  // формы длинные: поле или кнопка могут быть ниже экрана, листаем, пока не появятся
  async reveal(el) {
    for (let i = 0; i < 4 && !(await el.isDisplayed()); i++) {
      const { width, height } = await driver.getWindowSize();
      await driver.execute('mobile: scrollGesture', {
        left: width * 0.1, top: height * 0.3, width: width * 0.8, height: height * 0.5, direction: 'down', percent: 0.8,
      });
    }
  }

  async fill(fields) {
    for (const [name, value] of Object.entries(fields)) {
      const el = await this.field(name);
      await this.reveal(el);
      await el.setValue(value);
    }
    if (await driver.isKeyboardShown()) await driver.hideKeyboard();
  }

  async tap(button) {
    await this.reveal(button);
    await button.click();
  }

  async fillAddress(a) {
    await this.toPayment.waitForExist({ timeout: 20000 });
    await this.fill({ fullNameET: a.fullName, address1ET: a.address1, cityET: a.city, zipET: a.zip, countryET: a.country });
    await this.tap(await this.toPayment);
  }

  async fillPayment(p) {
    await this.reviewOrder.waitForExist({ timeout: 20000 });
    await this.fill({ nameET: p.name, cardNumberET: p.card, expirationDateET: p.expiry, securityCodeET: p.cvv });
    await this.tap(await this.reviewOrder);
  }

  async totalValue() { return price(await this.totalAmount.getText()); }
}

module.exports = { CheckoutPage: new CheckoutPage() };
