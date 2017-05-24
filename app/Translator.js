import React from 'react';
import {connect} from 'react-redux'
import {addLocaleData, IntlProvider} from 'react-intl';
import {DEFAULT_LANGUAGE} from 'app/client_config';
import store from 'store';
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
        const locale = store.get('language') || DEFAULT_LANGUAGE
        // const locale = this.props.locale || DEFAULT_LANGUAGE;
        const localeWithoutRegionCode = locale.toLowerCase().split(/[_-]+/)[0];
        tt.setLocale(localeWithoutRegionCode)
		    tt.setFallbackLocale('en');
        return <IntlProvider
            // to ensure dynamic language change, "key" property with same "locale" info must be added
            // see: https://github.com/yahoo/react-intl/wiki/Components#multiple-intl-contexts
            key={localeWithoutRegionCode}
            locale={localeWithoutRegionCode}
            defaultLocale={DEFAULT_LANGUAGE}
        >
            {this.props.children}
        </IntlProvider>
    }
}

export default connect(
    (state, ownProps) => {
        const locale = state.user.get('locale');
        return {...ownProps, locale};
    }
)(Translator)

export const FormattedHTMLMessage = ({id, params, className}) => (
    <div className={'FormattedHTMLMessage' + (className ? ` ${className}` : '')} dangerouslySetInnerHTML={ { __html: tt(id, params) } }></div>
);
