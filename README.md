# Android mobile autotests: Appium + Maestro

**QA Engineer: Sony Fridmo**

[![Android tests](https://github.com/sonyfrid/android-mobile-autotests/actions/workflows/android-tests.yml/badge.svg)](https://github.com/sonyfrid/android-mobile-autotests/actions/workflows/android-tests.yml)

Автоматизация мобильного тестирования Android-приложения интернет-магазина
([Sauce Labs My Demo App](https://github.com/saucelabs/my-demo-app-android), открытое приложение для практики автотестов):
каталог, карточка товара, корзина, вход, оформление заказа.

Одни и те же сценарии на двух инструментах:
- **Appium 2 + WebdriverIO (JavaScript)**: Page Object, Mocha, Allure-отчёт со скриншотом, видео и XML экрана при падении;
- **Maestro**: короткие YAML-флоу и переиспользуемые подфлоу, удобно для smoke и быстрых проверок перед релизом.

Тесты запускаются в **GitHub Actions на Android-эмуляторе** на каждый push и pull request.

## Что проверяется

### Appium + WebdriverIO
| Модуль | Сценарии |
|---|---|
| Каталог | товары и цены после запуска; сортировка по названию и по цене в обе стороны |
| Карточка товара | название и цена совпадают с каталогом; «+» и «−» меняют количество; «Add to cart» добавляет выбранное количество |
| Корзина | пустая корзина и «Go Shopping»; два товара и итог = сумма цен; пересчёт итога при изменении количества; удаление; **корзина сохраняется после сворачивания приложения и поворота экрана** |
| Вход | пустой логин, пустой пароль, заблокированный пользователь, успешный вход |
| Оформление (E2E) | гость: корзина → вход → адрес → оплата → проверка → заказ оформлен, корзина пуста; валидация обязательных полей адреса |

Тесты с тегом `@smoke` можно гонять отдельно: `npm run test:smoke`.

### Maestro
| Флоу | Что делает |
|---|---|
| `01_catalog_smoke` | каталог открылся, сортировка по цене |
| `02_add_to_cart` | товар в корзине, счётчик обновился |
| `03_cart_remove` | удаление из корзины, пустое состояние |
| `04_login_locked` | заблокированный пользователь не входит |
| `05_checkout_e2e` | полный путь покупки от каталога до «Checkout Complete» |

## Подходы

- **Независимые тесты.** Перед каждым тестом данные приложения стираются (`mobile: clearApp`), приложение стартует заново.
- **Стабильные локаторы.** accessibility id и resource-id, текст только там, где он и есть проверка. Без XPath.
- **Без sleep.** Только явные ожидания (`waitForDisplayed`, `extendedWaitUntil`).
- **Мобильная специфика.** Сворачивание и возврат приложения, поворот экрана, клавиатура, длинные формы с прокруткой.
- **Разбор падений.** В Allure-отчёте у упавшего теста скриншот, видео прогона и XML экрана; ретрай один раз только в CI.

## Структура

```
├── appium/
│   ├── wdio.conf.js        # WebdriverIO: capabilities, Appium service, Allure, сброс приложения, видео
│   ├── pages/              # Page Object: Base (шапка), Catalog, Product, Cart, Login, Checkout
│   ├── specs/              # catalog, product, cart, login, checkout
│   └── support/            # локаторы, тестовые данные
├── maestro/
│   ├── flows/              # 5 флоу
│   └── subflows/           # «добавить товар», «войти»
└── .github/workflows/      # CI: эмулятор Android, Appium и Maestro, отчёты в артефактах
```

## Запуск локально

Нужны Android SDK с эмулятором (или телефон с отладкой по USB), Node.js 22, Java 17.

```bash
# приложение
mkdir -p apps && curl -L -o apps/mda.apk https://github.com/saucelabs/my-demo-app-android/releases/download/2.3.0/mda-2.3.0-27.apk

# Appium + WebdriverIO
npm ci
npm install -g appium@2 && appium driver install uiautomator2
npm test                      # все тесты
npm run test:smoke            # только @smoke
npm run allure                # отчёт в allure-report/

# Maestro
curl -Ls "https://get.maestro.mobile.dev" | bash
adb install -r apps/mda.apk
maestro test maestro/
```
