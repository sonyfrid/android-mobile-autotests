const { ArticlePage } = require('../pages/ArticlePage');
const { skipOnboarding } = require('../support/flows');
const { APP_ID } = require('../support/app');
const { article } = require('../support/data');

describe('Ссылки на статьи', () => {
  it('@smoke ссылка en.wikipedia.org открывает статью прямо в приложении', async () => {
    await skipOnboarding();
    await driver.execute('mobile: deepLink', { url: article.url, package: APP_ID });
    await ArticlePage.waitLoaded(article.description);
    await expect(ArticlePage.heading(article.title)).toExist();
  });

  it('у открытой по ссылке статьи работает «Navigate up»', async () => {
    await skipOnboarding();
    await driver.execute('mobile: deepLink', { url: article.url, package: APP_ID });
    await ArticlePage.waitLoaded(article.description);
    await ArticlePage.navigateUp.click();
    await expect(ArticlePage.save).not.toBeDisplayed();
  });
});
