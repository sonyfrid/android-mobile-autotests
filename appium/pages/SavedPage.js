const { text } = require('../support/app');

// Вкладка Saved: вкладки «All articles» и «Reading lists», сверху может быть карточка синхронизации
class SavedPage {
  get allArticles() { return $(text('All articles')); }
  get readingLists() { return $(text('Reading lists')); }
  get notNow() { return $(text('Not now')); }

  article(title) { return $(text(title)); }

  async open() {
    await this.allArticles.waitForDisplayed({ timeout: 20000 });
    if (await this.notNow.isExisting()) await this.notNow.click();
    await this.allArticles.click();
  }
}

module.exports = { SavedPage: new SavedPage() };
