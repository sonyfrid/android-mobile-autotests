const { id, desc, text } = require('../support/app');

// Главный экран: нижние вкладки Home, Saved, Search, Activity, More
class MainPage {
  get homeTab() { return $(id('nav_tab_home')); }
  get savedTab() { return $(id('nav_tab_reading_lists')); }
  get searchTab() { return $(id('nav_tab_search')); }
  get moreTab() { return $(id('nav_tab_more')); }

  // вкладка Search: строка поиска и история просмотров
  get searchCard() { return $(id('search_card')); }
  get historyTitle() { return $(id('history_title')); }
  get historyEmpty() { return $(id('history_empty_title')); }

  async waitLoaded() { await this.homeTab.waitForDisplayed({ timeout: 30000 }); }

  // при первом открытии поиска приложение показывает промо виджета: закрываем, если есть
  async closePromo() {
    const close = await $(desc('Close'));
    if (await close.isExisting()) await close.click();
  }

  async openSearchTab() {
    await this.searchTab.click();
    await this.closePromo();
    await this.searchCard.waitForDisplayed();
  }

  async openSearch() {
    await this.openSearchTab();
    await this.searchCard.click();
  }

  historyItem(title) { return $(text(title)); }
}

module.exports = { MainPage: new MainPage() };
