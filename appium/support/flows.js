// Общие шаги: пропустить онбординг, найти и открыть статью
const { OnboardingPage } = require('../pages/OnboardingPage');
const { MainPage } = require('../pages/MainPage');
const { SearchPage } = require('../pages/SearchPage');
const { ArticlePage } = require('../pages/ArticlePage');
const { article } = require('./data');

async function skipOnboarding() {
  await OnboardingPage.skipAll();
  await MainPage.waitLoaded();
}

async function openArticle(a = article) {
  await MainPage.openSearch();
  await SearchPage.search(a.query);
  await SearchPage.openResult(a.description);
  await ArticlePage.waitLoaded(a.description);
}

module.exports = { skipOnboarding, openArticle };
