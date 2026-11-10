const { BasePage } = require('./BasePage');
const { id, desc, price } = require('../support/app');

class ProductPage extends BasePage {
  get name() { return $(id('productTV')); }
  get price() { return $(id('priceTV')); }
  get quantity() { return $(id('noTV')); }
  get plus() { return $(desc('Increase item quantity')); }
  get minus() { return $(desc('Decrease item quantity')); }
  get addToCart() { return $(desc('Tap to add product to cart')); }

  async waitLoaded() { await this.addToCart.waitForDisplayed({ timeout: 20000 }); }

  async priceValue() { return price(await this.price.getText()); }

  async quantityValue() { return Number(await this.quantity.getText()); }
}

module.exports = { ProductPage: new ProductPage() };
