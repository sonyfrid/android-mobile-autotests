const APP_ID = 'com.saucelabs.mydemoapp.android';

// Локаторы приложения: id ресурса, accessibility id (content-desc) и UiSelector по тексту
const id = (name) => `id=${APP_ID}:id/${name}`;
const desc = (text) => `~${text}`;
const text = (value) => `android=new UiSelector().text("${value}")`;
const textContains = (value) => `android=new UiSelector().textContains("${value}")`;

// прокрутить экран до элемента с текстом (RecyclerView, ScrollView)
const scrollToText = (value) =>
  `android=new UiScrollable(new UiSelector().scrollable(true)).scrollIntoView(new UiSelector().text("${value}"))`;

async function resetApp() {
  await driver.execute('mobile: clearApp', { appId: APP_ID });
  await driver.activateApp(APP_ID);
}

// «$29.99» → 29.99
const price = (value) => Number(String(value).replace(/[^0-9.]/g, ''));

module.exports = { APP_ID, id, desc, text, textContains, scrollToText, resetApp, price };
