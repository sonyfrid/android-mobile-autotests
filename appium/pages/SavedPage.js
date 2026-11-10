const { id, text } = require('../support/app');

// Вкладка Saved: списки для чтения. По умолчанию есть список «Saved»
class SavedPage {
  get recycler() { return $(id('reading_list_recycler_view')); }
  get emptyText() { return $(id('reading_list_empty_text')); }

  list(name) { return $(`android=new UiSelector().resourceId("org.wikipedia:id/item_title").text("${name}")`); }
  article(title) { return $(text(title)); }

  async openList(name = 'Saved') {
    const byId = await this.list(name);
    if (await byId.isExisting()) return byId.click();
    return $(text(name)).click();
  }
}

module.exports = { SavedPage: new SavedPage() };
