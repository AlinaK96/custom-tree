# InkaUi Custom Components

#### Установка зависимостей
1.  npm i в папке controls
2. npm run build в папке controls
3. перейти в папку компонента в установить зависимости npm i
4. npm run build
5. npm run start для запуска компонента


файл собранного компонента projects/inka-ui-viewer/src/assets/web-components/custom-control-components.js

#### Генерация метаданных компонента
npm run build
npm run component-metadata:generate
файл со сгенерированными метаданными dist/custom-component-metadata\custom-component-metadata.json

#### Настройка метеданных копонента
настройки метаданных компонента расположены в папке src/ui-component-metadata

src/ui-component-metadata/components/custom-component.json - файл с метаданным кастомного компонента

src/ui-component-metadata/actions.json - файл с описанием всех действий UI конструктора

src/ui-component-metadata/validators.json - файл с описанием всех валидаторов UI конструктора

src/ui-component-metadata/generated-events.json файл с описанием асех событий UI констркутора (можно расширять в рамках кастомного компонента)

#### Настройка неймспейса кастомного компонента
для корректной работы кастомный компонентов у каждого компонента должен быть уникальный неймспейс. Он настраивается в файле webpack.extra.js свойство uniqueName

ВАЖНО!!! uniqueName уникальный для каждого кастомного компонента


Общее правило: префикс "custom-", Ограничения по наименованию: латинские буквы, цифры, -, строчные буквы. 

Type в метаданных: custom-* 

Webpack unique name: custom-* 

Selector: inka-ui-custom-*