const { id, desc } = require('../support/app');

// Шапка есть на всех экранах: меню, сортировка, корзина со счётчиком
class BasePage {
  get menuButton() { return $(desc('View menu')); }
  get cartButton() { return $(desc('View cart')); }
  get cartBadge() { return $(id('cartTV')); }

  async cartCount() {
    if (!(await this.cartBadge.isExisting())) return 0;
    const value = await this.cartBadge.getText();
    return value ? Number(value) : 0;
  }

  async openCart() {
    await this.cartButton.click();
  }

  async openMenuItem(name) {
    await this.menuButton.click();
    const item = await $(`android=new UiSelector().resourceId("com.saucelabs.mydemoapp.android:id/itemTV").text("${name}")`);
    await item.waitForDisplayed();
    await item.click();
  }

  // свернуть приложение и вернуть его, как будто пользователь отвлёкся на другое приложение
  async sendToBackground(seconds = 3) {
    await driver.execute('mobile: backgroundApp', { seconds });
  }
}

module.exports = { BasePage };
