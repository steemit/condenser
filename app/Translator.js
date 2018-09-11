import React, { Component } from 'react';
import { connect } from 'react-redux';
import { addLocaleData, IntlProvider } from 'react-intl';
import tt from 'counterpart';

import { DEFAULT_LANGUAGE } from 'app/client_config';
import en from 'react-intl/locale-data/en';
import ru from 'react-intl/locale-data/ru';
import uk from 'react-intl/locale-data/uk';

addLocaleData([...en, ...ru, ...uk]);

tt.registerTranslations('en', require('app/locales/en.json'));
tt.registerTranslations('ru', require('app/locales/ru-RU.json'));
tt.registerTranslations('uk', require('app/locales/ua.json'));

@connect((state) => ({
    //locale: state.user.get('locale')
    locale: state.data.settings.getIn(['basic', 'lang'], DEFAULT_LANGUAGE)
}))
export default class Translator extends Component {
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
