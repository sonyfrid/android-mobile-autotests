const { BasePage } = require('./BasePage');
const { id, desc, text, price } = require('../support/app');

class CatalogPage extends BasePage {
  get title() { return $(id('productTV')); }
  get sortButton() { return $(desc('Shows current sorting order and displays available sorting options')); }
  get productTitles() { return $$(id('titleTV')); }
  get productPrices() { return $$(id('priceTV')); }

  async waitLoaded() {
    await this.title.waitForDisplayed({ timeout: 30000 });
    await this.productTitles[0].waitForDisplayed();
  }

  async visibleNames() { return this.productTitles.map((el) => el.getText()); }

  async visiblePrices() { return (await this.productPrices.map((el) => el.getText())).map(price); }

  async sortBy(option) {
    await this.sortButton.click();
    const item = await $(desc(option));
    await item.waitForDisplayed();
    await item.click();
    await this.productTitles[0].waitForDisplayed();
  }

  async openProduct(index = 0) {
    const images = await $$(desc('Displays selected product'));
    await images[index].click();
  }

  async openProductByName(name) {
    await $(text(name)).click();
  }
}

module.exports = { CatalogPage: new CatalogPage() };
