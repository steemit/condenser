import React from 'react';
import { connect } from 'react-redux';
import { addLocaleData, IntlProvider } from 'react-intl';
import { DEFAULT_LANGUAGE } from 'app/client_config';
import tt from 'counterpart';
import en from 'react-intl/locale-data/en';
import ru from 'react-intl/locale-data/ru';
import uk from 'react-intl/locale-data/uk';
import sr from 'react-intl/locale-data/sr';
import ro from 'react-intl/locale-data/ro';

addLocaleData([...en, ...ru, ...uk, ...sr, ...ro]);

tt.registerTranslations('en', require('app/locales/en.json'));
tt.registerTranslations('ru', require('app/locales/ru-RU.json'));
tt.registerTranslations('uk', require('app/locales/ua.json'));
tt.registerTranslations('sr', require('app/locales/sr.json'));
tt.registerTranslations('ro', require('app/locales/ro-RO.json'));

class Translator extends React.Component {
    render() {
        const localeWithoutRegionCode = this.props.locale
            .toLowerCase()
            .split(/[_-]+/)[0];

        tt.setLocale(localeWithoutRegionCode);
        tt.setFallbackLocale('en');

        return (
            <IntlProvider
                key={localeWithoutRegionCode}
                locale={localeWithoutRegionCode}
                defaultLocale={DEFAULT_LANGUAGE}
            >
                {this.props.children}
            </IntlProvider>
        );
    }
}

export default connect((state, props) => {
    return {
        ...props,
        locale: state.user.get('locale'),
    };
})(Translator);
