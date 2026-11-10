const { MainPage } = require('../pages/MainPage');
const { ArticlePage } = require('../pages/ArticlePage');
const { SavedPage } = require('../pages/SavedPage');
const { skipOnboarding, openArticle } = require('../support/flows');
const { setOnline, resetApp } = require('../support/app');
const { article } = require('../support/data');

async function backToMain() {
  for (let i = 0; i < 4 && !(await MainPage.homeTab.isDisplayed()); i++) await driver.back();
  await MainPage.waitLoaded();
}

describe('Сохранённые статьи и история', () => {
  // каждый тест с чистого листа: данные приложения стёрты, приложение запущено заново
  beforeEach(async () => {
    await resetApp();
    await skipOnboarding();
  });

  it('@smoke сохранённая статья появляется в списке «Saved»', async () => {
    await openArticle();
    await ArticlePage.saveToDefaultList();
    await backToMain();
    await MainPage.savedTab.click();
    await SavedPage.openList('Saved');
    await expect(SavedPage.article(article.title)).toBeDisplayed();
  });

  it('прочитанная статья попадает в историю на вкладке Search', async () => {
    await openArticle();
    await backToMain();
    await MainPage.openSearchTab();
    await expect(MainPage.historyTitle).toBeDisplayed();
    await expect(MainPage.historyItem(article.title)).toBeDisplayed();
    await expect(MainPage.historyEmpty).not.toBeDisplayed();
  });

  it('сохранённая статья открывается без интернета', async () => {
    await openArticle();
    await ArticlePage.saveToDefaultList();
    await driver.pause(5000); // приложение скачивает статью для офлайна
    await backToMain();
    await setOnline(false);
    try {
      await MainPage.savedTab.click();
      await SavedPage.openList('Saved');
      await SavedPage.article(article.title).click();
      await ArticlePage.waitLoaded(article.description);
    } finally {
      await setOnline(true);
    }
  });
});
