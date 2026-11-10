const { desc, text } = require('../support/app');

// Первый запуск: несколько экранов приветствия (Jetpack Compose, без id)
class OnboardingPage {
  get firstTitle() { return $(text("All the world's knowledge")); }
  get forward() { return $(desc('Forward')); }
  get skip() { return $(text('Skip')); }

  async waitShown() { await this.firstTitle.waitForDisplayed({ timeout: 30000 }); }

  async skipAll() {
    await this.waitShown();
    await this.skip.click();
  }
}

module.exports = { OnboardingPage: new OnboardingPage() };
