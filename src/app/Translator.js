import React from 'react';
import { connect } from 'react-redux';
import { IntlProvider, addLocaleData } from 'react-intl';
import en from 'react-intl/locale-data/en';
import es from 'react-intl/locale-data/es';
import ru from 'react-intl/locale-data/ru';
import fr from 'react-intl/locale-data/fr';
import it from 'react-intl/locale-data/it';
import ko from 'react-intl/locale-data/ko';
import zh from 'react-intl/locale-data/zh';
import pl from 'react-intl/locale-data/pl';
import ja from 'react-intl/locale-data/ja';
import { DEFAULT_LANGUAGE } from 'app/client_config';
import tt from 'counterpart';

addLocaleData([...en, ...es, ...ru, ...fr, ...it, ...ko, ...zh, ...pl, ...ja]);

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

tt.registerTranslations('ja', require('app/locales/counterpart/ja'));
tt.registerTranslations('ja', require('app/locales/ja.json'));

if (process.env.NODE_ENV === 'production') {
    tt.setFallbackLocale('en');
}

class Translator extends React.Component {
    render() {
        const language = this.props.locale;
        tt.setLocale(language);
        return (
            <IntlProvider
                // to ensure dynamic language change, "key" property with same "locale" info must be added
                // see: https://github.com/yahoo/react-intl/wiki/Components#multiple-intl-contexts
                key={language}
                locale={language}
                defaultLocale={DEFAULT_LANGUAGE}
            >
                {this.props.children}
            </IntlProvider>
        );
    }
}

export default connect((state, ownProps) => {
    const locale = state.app.getIn(['user_preferences', 'locale']);
    return { ...ownProps, locale };
})(Translator);

export const FormattedHTMLMessage = ({ id, params, className }) => (
    <div
        className={'FormattedHTMLMessage' + (className ? ` ${className}` : '')}
        dangerouslySetInnerHTML={{ __html: tt(id, params) }}
    />
);
