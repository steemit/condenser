import { addDecorator, configure } from '@storybook/react';
import { setIntlConfig, withIntl } from 'storybook-addon-intl';
import tt from 'counterpart';
import { addLocaleData } from 'react-intl';
import en from 'react-intl/locale-data/en';
import es from 'react-intl/locale-data/es';
import ru from 'react-intl/locale-data/ru';
import fr from 'react-intl/locale-data/fr';
import it from 'react-intl/locale-data/it';
import ko from 'react-intl/locale-data/ko';
import zh from 'react-intl/locale-data/zh';
import pl from 'react-intl/locale-data/pl';

addLocaleData([...en, ...es, ...ru, ...fr, ...it, ...ko, ...zh, ...pl]);

tt.registerTranslations('en', require('counterpart/locales/en'));
tt.registerTranslations('en', require('app/locales/en.json'));

tt.registerTranslations('es', require('app/locales/counterpart/es'));
tt.registerTranslations('es', require('app/locales/es.json'));

tt.registerTranslations('ru', require('counterpart/locales/ru'));
tt.registerTranslations('ru', require('app/locales/ru.json'));

tt.registerTranslations('fr', require('app/locales/counterpart/fr'));
tt.registerTranslations('fr', require('app/locales/fr.json'));

tt.registerTranslations('it', require('app/locales/counterpart/it'));
tt.registerTranslations('it', require('app/locales/it.json'));

tt.registerTranslations('ko', require('app/locales/counterpart/ko'));
tt.registerTranslations('ko', require('app/locales/ko.json'));

tt.registerTranslations('zh', require('app/locales/counterpart/zh'));
tt.registerTranslations('zh', require('app/locales/zh.json'));

tt.registerTranslations('pl', require('app/locales/counterpart/pl'));
tt.registerTranslations('pl', require('app/locales/pl.json'));

const getMessages = (locale) => {
    tt.setLocale(locale)
    return tt('g')
}

setIntlConfig({
    locales: ['en', 'es', 'ru', 'fr', 'it', 'ko', 'zh', 'pl'],
    defaultLocale: 'en',
    getMessages
});

addDecorator(withIntl);

const req = require.context('../src/app/components', true, /story\.jsx$/);

function loadStories() {
  req.keys().forEach(req);
}

configure(loadStories, module);
