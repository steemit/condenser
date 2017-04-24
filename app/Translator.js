import React from 'react';
import {connect} from 'react-redux'
import {IntlProvider} from 'react-intl';
import {DEFAULT_LANGUAGE} from 'app/client_config';
import tt from 'counterpart';

tt.registerTranslations('en', require('app/locales/en.json'));

class Translator extends React.Component {
    render() {
        let language = this.props.locale;
        return <IntlProvider
            // to ensure dynamic language change, "key" property with same "locale" info must be added
            // see: https://github.com/yahoo/react-intl/wiki/Components#multiple-intl-contexts
            key={language}
            locale={language}
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
)(Translator);

export const FormattedHTMLMessage = ({id, params}) => (
    <span className="FormattedHTMLMessage" dangerouslySetInnerHTML={ { __html: tt(id, params) } }></span>
);
