<p align="center"><img src="docs/hero.png" alt="Wikipedia Android: мобильные автотесты" width="100%"></p>

# Wikipedia Android: мобильные автотесты на Appium и Maestro

**QA Engineer: Sony Fridmo**

[![Android tests](https://github.com/sonyfrid/android-mobile-autotests/actions/workflows/android-tests.yml/badge.svg)](https://github.com/sonyfrid/android-mobile-autotests/actions/workflows/android-tests.yml)
![Appium 3](https://img.shields.io/badge/Appium-3-662d91)
![WebdriverIO](https://img.shields.io/badge/WebdriverIO-9-ea5906)
![Maestro](https://img.shields.io/badge/Maestro-YAML-3DDC84)
![Allure](https://img.shields.io/badge/report-Allure-97cc64)

<table>
<tr>
<td width="300" align="center"><img src="docs/demo.gif" alt="Прогон сценария на эмуляторе" width="260"><br><sub>Настоящий прогон на эмуляторе, ускорено</sub></td>
<td>

Автотесты для официального Android-приложения **Wikipedia** (Wikimedia Foundation, 50+ млн установок,
[открытый код](https://github.com/wikimedia/apps-android-wikipedia)). Тестируется реальный релиз из F-Droid
(`org.wikipedia`, r/50616 от 2026-11-03): онбординг, поиск, статья, сохранённые статьи, история, офлайн, ссылки.

Один и тот же продукт покрыт двумя инструментами:
- **Appium 3 + WebdriverIO (JavaScript)**: Page Object, Mocha, Allure-отчёт; у упавшего теста скриншот, видео и снимок экрана (XML);
- **Maestro**: короткие YAML-флоу и переиспользуемые подфлоу для smoke-проверок перед релизом.

Всё запускается в **GitHub Actions на Android-эмуляторе** (API 30, Pixel 6) на каждый push и pull request.

</td>
</tr>
</table>

## Что видит тест

<table>
<tr>
<td align="center"><img src="docs/screens/01_welcome.png" width="150" alt="Онбординг"><br><sub><b>Онбординг</b><br>листание и пропуск</sub></td>
<td align="center"><img src="docs/screens/03_search.png" width="150" alt="Поиск"><br><sub><b>Поиск</b><br>заголовок и описание</sub></td>
<td align="center"><img src="docs/screens/05_find.png" width="150" alt="Поиск по статье"><br><sub><b>Поиск по статье</b><br>счётчик совпадений</sub></td>
<td align="center"><img src="docs/screens/06_text_size.png" width="150" alt="Размер шрифта"><br><sub><b>Шрифт</b><br>кнопки «+» и «−»</sub></td>
<td align="center"><img src="docs/screens/07_saved.png" width="150" alt="Сохранённые"><br><sub><b>Сохранённые</b><br>статья в списке</sub></td>
</tr>
</table>

## Как это устроено

<img src="docs/architecture.svg" alt="Путь команды от теста до телефона: Appium и Maestro" width="100%">

<img src="docs/pipeline.svg" alt="CI: push, GitHub Actions, эмулятор, Appium и Maestro, отчёт" width="100%">

## Что проверяется

### Appium + WebdriverIO: 19 тестов
| Модуль | Сценарии |
|---|---|
| Онбординг | приветствие и переход на главный экран; «Forward» листает экраны; после онбординга перезапуск сразу открывает главный экран |
| Поиск | результаты с заголовком и описанием; открытие статьи; «Clear query»; бессмысленный запрос не находит статью |
| Статья | поиск по тексту статьи и «Find next»; 0 совпадений; размер шрифта «+» и «−»; содержание с разделами; **поворот экрана**; **сворачивание и возврат** |
| Сохранённые и история | сохранение в список и проверка во вкладке Saved; «Recent searches»; история просмотров; **сохранённая статья открывается без интернета** |
| Ссылки | ссылка `en.wikipedia.org/wiki/...` открывает статью прямо в приложении (deep link); «Navigate up» |

Отдельный прогон только `@smoke`: `npm run test:smoke`.

### Maestro: 5 флоу
| Флоу | Что делает |
|---|---|
| `01_onboarding` | приветствие, листание, переход на главный экран |
| `02_search_article` | поиск и открытие статьи |
| `03_save_to_list` | сохранение статьи и проверка во вкладке Saved |
| `04_find_in_article` | поиск по тексту статьи, счётчик и «следующее совпадение» |
| `05_text_size` | изменение размера шрифта и возврат к 100% |

## Подходы

- **Реальное приложение, не учебное.** Часть экранов на Jetpack Compose без id, сеть, промо-окна, которые появляются не всегда, карточки синхронизации. Тесты это учитывают.
- **Как писались локаторы.** Сначала разведка: скрипт `tools/discover.py` проходит по экранам через adb на эмуляторе в CI и выписывает id, тексты и content-desc. Локаторы строятся по этим данным: resource-id, затем accessibility id, текст там, где он сам является проверкой.
- **Независимые тесты.** Перед каждым тестом данные приложения стираются (`mobile: clearApp`), приложение стартует с нуля.
- **Мобильная специфика.** Поворот экрана, сворачивание, отключение сети (`mobile: setConnectivity`), deep link, клавиатура, системные диалоги «приложение не отвечает» на медленном эмуляторе.
- **Разбор падений.** В Allure-отчёте скриншот, видео и XML экрана; краткий снимок экрана печатается прямо в лог CI. Один ретрай только в CI.

## Структура

```
├── appium/
│   ├── wdio.conf.js        # capabilities, Appium service, Allure, видео и снимок экрана при падении
│   ├── pages/              # Page Object: Onboarding, Main (вкладки), Search, Article, Saved
│   ├── specs/              # onboarding, search, article, saved, deeplink
│   └── support/            # локаторы, общие шаги, тестовые данные
├── maestro/
│   ├── flows/              # 5 флоу
│   └── subflows/           # «пропустить онбординг», «открыть статью»
├── tools/
│   ├── discover.py         # разведка экранов через adb
│   └── prepare_emulator.py # подготовка эмулятора в CI
└── .github/workflows/      # CI: эмулятор, Appium и Maestro, отчёты в артефактах
```

## Запуск локально

Нужны Android SDK с эмулятором (или телефон с отладкой по USB), Node.js 22, Java 17.

```bash
# приложение (стабильный релиз из F-Droid)
mkdir -p apps && curl -L -o apps/wikipedia.apk https://f-droid.org/repo/org.wikipedia_50616.apk

# Appium + WebdriverIO
npm ci
npm install -g appium && appium driver install uiautomator2
npm test                  # все тесты
npm run test:smoke        # только @smoke
npm run allure            # отчёт в allure-report/

# Maestro
curl -Ls "https://get.maestro.mobile.dev" | bash
adb install -r apps/wikipedia.apk
maestro test maestro/
```
