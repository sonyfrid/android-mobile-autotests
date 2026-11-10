const { MainPage } = require('../pages/MainPage');
const { SearchPage } = require('../pages/SearchPage');
const { ArticlePage } = require('../pages/ArticlePage');
const { skipOnboarding } = require('../support/flows');
const { article, nonsense } = require('../support/data');

describe('Поиск', () => {
  beforeEach(async () => {
    await skipOnboarding();
    await MainPage.openSearch();
  });

  it('@smoke поиск находит статью: в результатах заголовок и описание', async () => {
    await SearchPage.search(article.query);
    await expect(SearchPage.resultByDescription(article.description)).toBeDisplayed();
  });

  it('@smoke открытие результата показывает статью', async () => {
    await SearchPage.search(article.query);
    await SearchPage.openResult(article.description);
    await ArticlePage.waitLoaded(article.description);
    await expect(ArticlePage.heading(article.title)).toExist();
    await expect(ArticlePage.textInArticle(article.wordInText)).toExist();
  });

  it('«Clear query» очищает поле поиска', async () => {
    await SearchPage.search(article.query);
    await SearchPage.clear.click();
    await expect(SearchPage.input).not.toHaveText(article.query);
    await expect(SearchPage.resultByDescription(article.description)).not.toBeDisplayed();
  });

  it('бессмысленный запрос не находит статью «Appium»', async () => {
    await SearchPage.search(nonsense);
    await driver.pause(3000); // запрос уходит в сеть с задержкой ввода; ждём, что результат так и не появится
    await expect(SearchPage.resultByDescription(article.description)).not.toBeDisplayed();
  });
});
