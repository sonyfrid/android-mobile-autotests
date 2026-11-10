const { CatalogPage } = require('../pages/CatalogPage');
const { LoginPage } = require('../pages/LoginPage');
const { users } = require('../support/data');

describe('Вход', () => {
  beforeEach(async () => {
    await CatalogPage.waitLoaded();
    await CatalogPage.openMenuItem('Log In');
    await LoginPage.waitLoaded();
  });

  it('пустой логин: ошибка «Username is required»', async () => {
    await LoginPage.loginButton.click();
    await expect(LoginPage.usernameError).toBeDisplayed();
    await expect(LoginPage.usernameError).toHaveText('Username is required');
  });

  it('пустой пароль: ошибка «Enter Password»', async () => {
    await LoginPage.username.setValue(users.standard.username);
    if (await driver.isKeyboardShown()) await driver.hideKeyboard();
    await LoginPage.loginButton.click();
    await expect(LoginPage.passwordError).toHaveText('Enter Password');
  });

  it('заблокированный пользователь не входит и видит причину', async () => {
    await LoginPage.login(users.locked.username, users.locked.password);
    await expect(LoginPage.passwordError).toHaveText('Sorry this user has been locked out.');
    await expect(LoginPage.loginButton).toBeDisplayed();
  });

  it('@smoke успешный вход возвращает в каталог, в меню появляется «Log Out»', async () => {
    await LoginPage.login(users.standard.username, users.standard.password);
    await CatalogPage.waitLoaded();
    await CatalogPage.menuButton.click();
    await expect($('android=new UiSelector().text("Log Out")')).toBeDisplayed();
    await driver.back();
  });
});
