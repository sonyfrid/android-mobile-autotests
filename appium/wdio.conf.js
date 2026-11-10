const path = require('path');

const APP = process.env.APP_PATH || path.resolve(__dirname, '../apps/mda.apk');

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
    'appium:appPackage': 'com.saucelabs.mydemoapp.android',
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

  // каждый тест с чистого листа: данные приложения стираются, приложение стартует заново
  beforeTest: async function () {
    const { resetApp } = require('./support/app');
    await resetApp();
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
    if (source) allure.addAttachment('page-source', source, 'application/xml');
  },
};
