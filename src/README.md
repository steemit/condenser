# Вступление

Наш проект должен совмещать в себе лучшие практики разделения логики и организации кода, поэтому в своей работе мы используем ```react, redux, redux-saga, reselect, styled-components, storybook```.

# Структура проекта

Папка ```src``` является основной папкой, в которой мы храним:
* ```app``` - SPA-приложение
* ```server``` - SSR приложения и некоторое api для него

В свою очередь папка ```app``` имеет следующие вложенности:
```
├── components
│   ├── common
│   ├── golos-ui
│   └── папки с именами папок контейнеров
├── containers
├── helpers
├── redux 
│   ├── actions
│   ├── constants
│   ├── reducers
│   ├── sagas
│   └── selectors
└── themes
```

# Разделение логики проекта - app

Приложение имеет следующие слои распределения логики:
* ```store``` - папка redux
* ```selectors``` - папка redux/selectors
* ```containers``` - папка containers
* ```presentational components``` - папка components/(имя контейнера или страницы)
* ```dumb components``` - папка components/golos-ui, components/common и styled-components в presentational components 

## Store
* ```entities``` - хранит результат работы [redux-entities-immutable](https://github.com/beautyfree/redux-entities-immutable), после нормализации
* ```status``` - хранит статусы запросов, ошибки, данные которые нельзя вынести в entities из за неподходящей реализации api
* ```ui``` - хранит изменение интерфейса, сгруппированные по страницам
* и остальная структура хранения данных пришедшая от steem.it

## Selectors

Селекторы - это функции, задача которых забрать данные из стора, трансформировать и агрегировать их для дальнейшей передачи по следующим слоям.

## Containers

Контейнеры - это компоненты верхнего уровня, задачи которых получить данные и экшены через ```props```, и описать основные методы, которые понадобятся в presentational components.

Пример: [containers/userProfile/settings/SettingsContent](app/containers/userProfile/settings/SettingsContent.jsx)

## Presentational components

Это компоненты, которые лежат в папке ```components```, сгруппированные по папкам основываясь на принадлежности к конкретным контейнерам. Их задача получить ```props``` и методы от контейнера, описать рендеринг dumb components и передать им конечные данные.

В рамках этого слоя, в идеальном варианте, должен быть компонент, который является основным presentational component'ом для конкретного контейнера. Он должен описывать рендеринг других presentational components для разделения логики по выполняемым задачам и отображаемым сущностям.

Пример: [components/userProfile/SettingsShow](app/components/userProfile/SettingsShow.jsx)

## Dumb components

Это компоненты, которые не реализуют логику, не описывают экшены, а вызывают переданные методы и рендерят конечные данные.

Пример: [components/golos-ui](app/components/golos-ui/), [components/common](app/components/common/) и styled-components в presentational components

# Роутинг

## Проблемы

В текущей реализации роутинга пришедшей от steem.it есть как минимум две проблемы:
* Завязанность определения открытой страницы на регулярных выражениях, без использования возможностей пакета **react-router**, в следствии чего достаточно сложно понять какой компонент страницы сейчас отрендерен.
  
* Единное место сбора данных вопреки **redux** подходам из за которого сложно понять *как* и *где* сформированны данные заполнившие **store redux'а**.

Из за этих проблем вытекают сложности в реализации нового функционала и интуитивного понимании кода.

## Требования

Мы делаем SPA-приложение, которое работает со сложными структурами данных, требущих дополнительной обработки на клиенте после получения ответа от api. 

К тому же, основным требованием для нас является оптимизация страниц под работу поисковых ботов, поэтому мы должны реализовывать серверный рендеринг страниц(SSR).

Нам нужно сохранить возможность обработки данных и SSR, но избавится от текущих проблем благодаря последовательному рефакторингу, без масштабной переделки проекта в течении долгого времени, а в рамках реализации новых страниц. 

## Стратегия улучшения

* Работая над новой страницей, в app/RootRoute.js нужно описать новый роут с path и component(loadable контейнер) в самом нижнем условии(после else).
* Каждый контейнер, которому требуются данные для SSR, должен реализовывать статичный async метод getInitialProps с вызывами экшенов(например, выполняющих запросы к api).
* Сервер должен искать текущий роут и вызывать метод getInitialProps у отсносящегося к нему компоненту.

### Материал для изучения

* https://github.com/navgarcha/redux-thunk-saga/blob/master/src/server/utils/renderReact.js#L8-L51
* https://github.com/suciuvlad/react-universal-starter/blob/master/packages/core/src/load-initial-props.tsx
* https://github.com/redux-saga/redux-saga/issues/255#issuecomment-308368729
* https://medium.com/@navgarcha7891/react-server-side-rendering-with-simple-redux-store-hydration-9f77ab66900a