const { BasePage } = require('./BasePage');
const { id, desc } = require('../support/app');

class LoginPage extends BasePage {
  get username() { return $(id('nameET')); }
  get password() { return $(id('passwordET')); }
  get loginButton() { return $(desc('Tap to login with given credentials')); }
  get usernameError() { return $(id('nameErrorTV')); }
  get passwordError() { return $(id('passwordErrorTV')); }

  async waitLoaded() { await this.loginButton.waitForDisplayed({ timeout: 20000 }); }

  async login(user, pass) {
    await this.username.setValue(user);
    await this.password.setValue(pass);
    if (await driver.isKeyboardShown()) await driver.hideKeyboard();
    await this.loginButton.click();
  }
}

module.exports = { LoginPage: new LoginPage() };
