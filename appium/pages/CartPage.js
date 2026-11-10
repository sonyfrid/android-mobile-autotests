const { BasePage } = require('./BasePage');
const { id, desc, text, price } = require('../support/app');

class CartPage extends BasePage {
  get title() { return $(text('My Cart')); }
  get itemTitles() { return $$(id('titleTV')); }
  get itemPrices() { return $$(id('priceTV')); }
  get itemQuantities() { return $$(id('noTV')); }
  get totalPrice() { return $(id('totalPriceTV')); }
  get itemsCount() { return $(id('itemsTV')); }
  get checkoutButton() { return $(desc('Confirms products for checkout')); }
  get emptyTitle() { return $(text('No Items')); }
  get goShopping() { return $(text('Go Shopping')); }

  async names() { return this.itemTitles.map((el) => el.getText()); }

  async prices() { return (await this.itemPrices.map((el) => el.getText())).map(price); }

  async quantities() { return (await this.itemQuantities.map((el) => el.getText())).map(Number); }

  async totalValue() { return price(await this.totalPrice.getText()); }

  async remove(index = 0) {
    const buttons = await $$(desc('Removes product from cart'));
    await buttons[index].click();
  }

  async increase(index = 0) {
    const buttons = await $$(desc('Increase item quantity'));
    await buttons[index].click();
  }
}

module.exports = { CartPage: new CartPage() };
