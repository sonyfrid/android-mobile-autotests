const { id, desc, text, textContains, textMatches } = require('../support/app');

// Статья: текст в WebView (виден UiAutomator как узлы с текстом) и нижняя панель действий
class ArticlePage {
  get save() { return $(id('page_save')); }
  get language() { return $(id('page_language')); }
  get findInArticle() { return $(id('page_find_in_article')); }
  get theme() { return $(id('page_theme')); }
  get contents() { return $(id('page_contents')); }
  get tabsCount() { return $(id('tabsCountText')); }
  get navigateUp() { return $(desc('Navigate up')); }

  // поиск по статье
  get findInput() { return $(id('search_src_text')); }
  get findNext() { return $(id('find_in_page_next')); }
  get findPrev() { return $(id('find_in_page_prev')); }
  get findMatch() { return $(id('find_in_page_match')); }
  get findDone() { return $(desc('Done')); }

  // окно темы и шрифта
  get textSize() { return $(id('text_size_percent')); }
  get increaseText() { return $(id('buttonIncreaseTextSize')); }
  get decreaseText() { return $(id('buttonDecreaseTextSize')); }
  get darkTheme() { return $(id('button_theme_dark')); }
  get lightTheme() { return $(id('button_theme_light')); }

  // окно «сохранить в список»
  get saveSheetTitle() { return $(text('Save articles in reading lists.')); }
  // строка списка по умолчанию «Saved»: нажимаем на её описание, оно часть кликабельной строки
  get defaultList() { return $(text('Save articles in reading lists.')); }

  heading(title) { return $(text(title)); }
  description(value) { return $(text(value)); }
  textInArticle(value) { return $(textContains(value)); }

  async waitLoaded(description) {
    await this.save.waitForDisplayed({ timeout: 30000 });
    if (description) await this.description(description).waitForDisplayed({ timeout: 30000 });
  }

  async saveToDefaultList() {
    await this.save.click();
    await this.defaultList.waitForDisplayed();
    await this.defaultList.click();
  }

  async findText(word) {
    await this.findInArticle.click();
    await this.findInput.waitForDisplayed();
    await this.findInput.setValue(word);
  }

  // «1/3» → { current: 1, total: 3 }
  async matchCounter() {
    const el = await $(textMatches('[0-9]+/[0-9]+'));
    await el.waitForDisplayed();
    const [current, total] = (await el.getText()).split('/').map(Number);
    return { current, total };
  }
}

module.exports = { ArticlePage: new ArticlePage() };
