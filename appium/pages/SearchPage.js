const { id, desc, text } = require('../support/app');

class SearchPage {
  get input() { return $(id('search_src_text')); }
  get clear() { return $(desc('Clear query')); }
  get languageButton() { return $(id('search_lang_button')); }

  // результаты на Compose: заголовок и описание статьи — отдельные тексты
  resultByDescription(description) { return $(text(description)); }

  async search(query) {
    await this.input.waitForDisplayed();
    await this.input.setValue(query);
  }

  async openResult(description) {
    const item = await this.resultByDescription(description);
    await item.waitForDisplayed({ timeout: 20000 });
    await item.click();
  }
}

module.exports = { SearchPage: new SearchPage() };
