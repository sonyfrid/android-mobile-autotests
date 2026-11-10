const { desc, text } = require('../support/app');

// Первый запуск: несколько экранов приветствия (Jetpack Compose, без id)
class OnboardingPage {
  get firstTitle() { return $(text("All the world's knowledge")); }
  get forward() { return $(desc('Forward')); }
  get skip() { return $(text('Skip')); }

  async waitShown() { await this.firstTitle.waitForDisplayed({ timeout: 30000 }); }

  // «Skip» появляется не на первом экране: листаем «Forward», пока он не станет доступен
  async skipAll() {
    await this.waitShown();
    for (let i = 0; i < 5 && !(await this.skip.isDisplayed()); i++) await this.forward.click();
    await this.skip.click();
  }
}

module.exports = { OnboardingPage: new OnboardingPage() };
