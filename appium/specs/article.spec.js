const { ArticlePage } = require('../pages/ArticlePage');
const { skipOnboarding, openArticle } = require('../support/flows');
const { article } = require('../support/data');

describe('Статья', () => {
  beforeEach(async () => {
    await skipOnboarding();
    await openArticle();
  });

  it('поиск по статье: находит совпадения, «Find next» переходит к следующему', async () => {
    await ArticlePage.findText('Appium');
    const first = await ArticlePage.matchCounter();
    expect(first.total).toBeGreaterThan(1);
    expect(first.current).toBe(1);
    await ArticlePage.findNext.click();
    await expect(await $(`android=new UiSelector().text("2/${first.total}")`)).toBeDisplayed();
    await ArticlePage.findDone.click();
    await expect(ArticlePage.save).toBeDisplayed();
  });

  it('поиск по статье: слова нет в тексте, совпадений 0', async () => {
    await ArticlePage.findText('zzqqxxnotfound');
    const { total } = await ArticlePage.matchCounter();
    expect(total).toBe(0);
  });

  it('размер шрифта: «+» увеличивает, «−» возвращает 100%', async () => {
    await ArticlePage.theme.click();
    await expect(ArticlePage.textSize).toHaveText(expect.stringContaining('100%'));
    await ArticlePage.increaseText.click();
    await expect(ArticlePage.textSize).not.toHaveText(expect.stringContaining('100%'));
    await ArticlePage.decreaseText.click();
    await expect(ArticlePage.textSize).toHaveText(expect.stringContaining('100%'));
  });

  it('содержание статьи показывает разделы', async () => {
    await ArticlePage.contents.click();
    await expect(await $(`android=new UiSelector().text("${article.section}")`)).toBeDisplayed();
  });

  it('статья остаётся открытой после поворота экрана', async () => {
    await driver.setOrientation('LANDSCAPE');
    try {
      await expect(ArticlePage.description(article.description)).toExist();
      await expect(ArticlePage.save).toBeDisplayed();
    } finally {
      await driver.setOrientation('PORTRAIT');
    }
  });

  it('статья остаётся открытой после сворачивания приложения', async () => {
    await driver.execute('mobile: backgroundApp', { seconds: 3 });
    await ArticlePage.waitLoaded(article.description);
  });
});
