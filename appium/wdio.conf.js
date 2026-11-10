const path = require('path');

const APP = process.env.APP_PATH || path.resolve(__dirname, '../apps/wikipedia.apk');

exports.config = {
  runner: 'local',
  specs: ['./specs/**/*.spec.js'],
  maxInstances: 1,
  port: 4723,
  services: [['appium', { command: process.env.APPIUM_CMD || 'appium', args: { relaxedSecurity: true }, logPath: './logs' }]],
  capabilities: [{
    platformName: 'Android',
    'appium:automationName': 'UiAutomator2',
    'appium:deviceName': process.env.DEVICE_NAME || 'Android Emulator',
    'appium:app': APP,
    'appium:appPackage': 'org.wikipedia',
    'appium:appActivity': 'org.wikipedia.main.MainActivity',
    'appium:appWaitActivity': '*',
    'appium:autoGrantPermissions': true,
    'appium:newCommandTimeout': 240,
    'appium:uiautomator2ServerInstallTimeout': 120000,
    'appium:adbExecTimeout': 120000,
  }],
  logLevel: 'warn',
  waitforTimeout: 15000,
  connectionRetryTimeout: 180000,
  connectionRetryCount: 2,
  framework: 'mocha',
  mochaOpts: { ui: 'bdd', timeout: 180000, retries: process.env.CI ? 1 : 0 },
  reporters: [
    'spec',
    ['allure', { outputDir: 'allure-results', disableWebdriverStepsReporting: true, disableWebdriverScreenshotsReporting: false }],
  ],

  // видео каждого теста; сброс приложения делает beforeEach в спеках (beforeTest идёт уже после beforeEach)
  beforeTest: async function () {
    await driver.startRecordingScreen({ timeLimit: 180 }).catch(() => {});
  },

  // при падении в Allure уходят скриншот, видео и XML экрана
  afterTest: async function (test, context, { passed }) {
    const allure = require('@wdio/allure-reporter').default;
    const video = await driver.stopRecordingScreen().catch(() => null);
    if (passed) return;
    const shot = await driver.takeScreenshot().catch(() => null);
    if (shot) allure.addAttachment('screenshot', Buffer.from(shot, 'base64'), 'image/png');
    if (video) allure.addAttachment('video', Buffer.from(video, 'base64'), 'video/mp4');
    const source = await driver.getPageSource().catch(() => null);
    if (source) {
      allure.addAttachment('page-source', source, 'application/xml');
      // краткий снимок экрана в лог CI: id, текст и описание элементов
      const attr = (tag, name) => ((tag.match(new RegExp(` ${name}="([^"]*)"`)) || [])[1] || '');
      const nodes = (source.match(/<[\w.]+ [^>]*>/g) || [])
        .map((tag) => [attr(tag, 'resource-id').replace('org.wikipedia:id/', ''), attr(tag, 'text').slice(0, 40), attr(tag, 'content-desc').slice(0, 40)].join('|'))
        .filter((l) => l.replace(/\|/g, '').trim());
      console.log(`\n[screen at failure: ${test.title}]\n${nodes.slice(0, 80).join('\n')}`);
    }
  },
};
