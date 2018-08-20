# Вступление

Наш проект должен совмещать в себе лучшие практики разделения логики и организации кода, поэтому в своей работе мы используем ```react, redux, redux-saga, reselect, styled-components, storybook```.

# Структура проекта

Папка ```src``` яаляется основной папкой, в которой мы храним:
* ```app``` - SPA-приложение
* ```server``` - SSR приложения и некоторое api для него (перенести)

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

# Разделение логики проекта

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