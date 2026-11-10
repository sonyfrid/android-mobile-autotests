const APP_ID = 'org.wikipedia';

// Локаторы: resource-id, accessibility id (content-desc), UiSelector по тексту.
// Часть экранов Wikipedia написана на Jetpack Compose: там нет id, поэтому ищем по тексту и описанию.
const id = (name) => `id=${APP_ID}:id/${name}`;
const desc = (text) => `~${text}`;
const text = (value) => `android=new UiSelector().text("${value}")`;
const textContains = (value) => `android=new UiSelector().textContains("${value}")`;
const textMatches = (regex) => `android=new UiSelector().textMatches("${regex}")`;

// На медленном эмуляторе в CI иногда всплывает системное «Приложение не отвечает»: жмём «Подождать»
async function dismissSystemDialogs() {
  for (let i = 0; i < 3; i++) {
    const wait = await $('id=android:id/aerr_wait');
    if (!(await wait.isExisting())) return;
    await wait.click();
  }
}

// Чистый старт: стираем данные приложения (онбординг, история, списки, настройки) и запускаем заново
async function resetApp() {
  await dismissSystemDialogs();
  await driver.execute('mobile: clearApp', { appId: APP_ID });
  await driver.activateApp(APP_ID);
  await dismissSystemDialogs();
}

async function setOnline(online) {
  await driver.execute('mobile: setConnectivity', { wifi: online, data: online });
}

module.exports = { APP_ID, id, desc, text, textContains, textMatches, dismissSystemDialogs, resetApp, setOnline };
