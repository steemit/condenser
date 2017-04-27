import React from 'react';
import {connect} from 'react-redux'
import {addLocaleData, IntlProvider} from 'react-intl';
import {DEFAULT_LANGUAGE} from 'app/client_config';
import tt from 'counterpart';
import en from 'react-intl/locale-data/en';
import ru from 'react-intl/locale-data/ru';

addLocaleData([...ru, ...en]);

tt.registerTranslations('en', require('app/locales/en.json'));
tt.registerTranslations('ru', require('app/locales/ru-RU.json'));

class Translator extends React.Component {
    render() {
        const locale = this.props.locale || DEFAULT_LANGUAGE;
        const localeWithoutRegionCode = language.toLowerCase().split(/[_-]+/)[0];
        tt.setLocale(localeWithoutRegionCode)
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
