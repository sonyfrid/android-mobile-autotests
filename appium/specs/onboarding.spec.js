const { resetApp } = require('../support/app');
const { OnboardingPage } = require('../pages/OnboardingPage');
const { MainPage } = require('../pages/MainPage');

describe('Онбординг', () => {
  // каждый тест с чистого листа: данные приложения стёрты, приложение запущено заново
  beforeEach(async () => {
    await resetApp();
  });

  it('@smoke первый запуск показывает приветствие, «Skip» ведёт на главный экран', async () => {
    await OnboardingPage.waitShown();
    await expect(OnboardingPage.forward).toBeDisplayed();
    await OnboardingPage.skipAll();
    await MainPage.waitLoaded();
    await expect(MainPage.savedTab).toBeDisplayed();
    await expect(MainPage.searchTab).toBeDisplayed();
  });

  it('«Forward» листает экраны приветствия, первый экран сменяется следующим', async () => {
    await OnboardingPage.waitShown();
    await OnboardingPage.forward.click();
    await expect(OnboardingPage.firstTitle).not.toBeDisplayed();
    await OnboardingPage.skipAll();
    await MainPage.waitLoaded();
  });

  it('после онбординга перезапуск приложения сразу открывает главный экран', async () => {
    await OnboardingPage.skipAll();
    await MainPage.waitLoaded();
    await driver.terminateApp('org.wikipedia');
    await driver.activateApp('org.wikipedia');
    await MainPage.waitLoaded();
    await expect(OnboardingPage.firstTitle).not.toBeDisplayed();
  });
});
