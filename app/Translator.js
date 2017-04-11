import React from 'react';
import isString from 'lodash/isString';
import isObject from 'lodash/isObject';
import isUndefined from 'lodash/isUndefined';
import { connect } from 'react-redux'
import { IntlProvider, addLocaleData, injectIntl } from 'react-intl';
import store from 'store';
import { DEFAULT_LANGUAGE } from 'config/client_config';

// most of this code creates a wrapper for i18n API.
// this is needed to make i18n future proof

/*
	module exports two functions: translate and translateHtml
	usage example:
	translate('reply_to_user', {username: 'undeadlol1') == 'Reply to undeadlol1'
	translateHtml works the same, expcept it renders string with html tags in it
*/

// locale data is needed for various messages, ie 'N minutes ago'
import enLocaleData from 'react-intl/locale-data/en';
import ruLocaleData from 'react-intl/locale-data/ru';
import ukLocaleData from 'react-intl/locale-data/uk'; // in react-intl they use 'uk' instead of 'ua'
import srLocaleData from 'react-intl/locale-data/sr'; http://www.iana.org/assignments/language-subtag-registry/language-subtag-registry
addLocaleData([...enLocaleData, ...ruLocaleData, ...ukLocaleData, ...srLocaleData]);

// Our translated strings
import { en } from './locales/en';
import { ru } from './locales/ru';
import { ua as uk } from './locales/ua';
import { rs_latin as sr } from './locales/rs';
const messages = { en, ru, uk, sr }

// exported function placeholders
// this is needed for proper export before react-intl functions with locale data,
// will be properly created (they depend on react props and context),
// which is not available until component is being created
//
/*
	this placeholder is needed for usage outside of react. In server side code and in static html files.
	This function is very simple, it does NOT support dynamic values (for example: translate('your_email_is', {email: 'x@y.com'})). Use it carefully
*/
let translate = string => {
	let language = DEFAULT_LANGUAGE
	if (process.env.BROWSER) language = store.get('language') || DEFAULT_LANGUAGE
	return messages[language][string]
};
let translateHtml = () => {};
let translatePlural = () => {};
let translateNumber = () => {};

// react-intl's formatMessage and formatHTMLMessage functions depend on context(this is where strings are stored)
// thats why we:
// 1) create instance of <IntlProvider /> which wraps our application and creates react context (see "Translator" component below)
// 2) create <DummyComponentToExportProps /> inside <IntlProvider /> (the "Translator" component)
// 3) now we have proper context which we use to export translate() and translateHtml() to be used anywhere
// all of this shenanigans are needed because many times translations are needed outside of components(in reducers and redux "connect" functions)
// but since react-intl functions depends on components context it would be not possible

class DummyComponentToExportProps extends React.Component {

	render() { // render hidden placeholder
		return <span hidden>{' '}</span>
	}

	// IMPORTANT
	// use 'componentWillMount' instead of 'componentDidMount',
	// or there will be all sorts of partially renddered components
	componentWillMount() {
		// assign functions after component is created (context is picked up)
		translate = 	(...params) => this.translateHandler('string', ...params)
		translateHtml = (...params) => this.translateHandler('html', ...params)
		translatePlural = (...params) => this.translateHandler('plural', ...params)
		translateNumber = (...params) => this.translateHandler('number', ...params)
	}

	translateHandler(translateType, id, values, options) {
		const 	{ formatMessage, formatHTMLMessage, formatPlural, formatNumber } = this.props.intl
		// choose which method of rendering to choose: normal string or string with html
		// handler = translateType === 'string' ? formatMessage : formatHTMLMessage
		let handler
		switch (translateType) {
			case 'string':
				handler = formatMessage; break
			case 'html':
				handler = formatHTMLMessage; break
			case 'plural':
				handler = formatPlural; break
			case 'number':
				handler = formatNumber; break
			default:
				throw new Error('unknown translate handler type')
		}
		// check if right parameters were used before running function
		if (isString(id)) {
			if (!isUndefined(values) && !isObject(values)) throw new Error('translating function second parameter must be an object!');
			// map parameters for react-intl,
			// which uses formatMessage({id: 'stringId', values: {some: 'values'}, options: {}}) structure
			// 'formatNumber' uses formatNumber(value: number) structure
			// else if (translateType == 'number') return handler(Number(id))
			else if (translateType == 'number') return Number(id).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
			// everything else uses formatMessage({id: 'stringId', values: {some: 'values'}, options: {}}) structure
			else return handler({id}, values, options)
		}
		else throw new Error('translating function first parameter must be a string!');
	}
}

// inject translation functions through 'intl' prop (not using decorator)
DummyComponentToExportProps = injectIntl(DummyComponentToExportProps)

// actual wrapper for application
class Translator extends React.Component {
	render() {
        /* LANGUAGE PICKER */

		// Define user's language. Different browsers have the user locale defined
		// on different fields on the `navigator` object, so we make sure to account
		// for these different by checking all of them
		let language = this.props.locale; // usually 'en'
		if (process.env.BROWSER) {
			const storredLanguage = store.get('language')
			if (storredLanguage) language = storredLanguage
		}
		// let language = DEFAULT_LANGUAGE; // usually 'en'
		// while Server Side Rendering is in process, 'navigator' is undefined
		// currently commented out, because in golos we need only russian
		// if (process.env.BROWSER) language = navigator
		// 									? (navigator.languages && navigator.languages[0])
		// 			                        || navigator.language
		// 			                        || navigator.userLanguage
		// 									: DEFAULT_LANGUAGE;
        //Split locales with a region code (ie. 'en-EN' to 'en')
        const languageWithoutRegionCode = language.toLowerCase().split(/[_-]+/)[0];

		return 	<IntlProvider
					// to ensure dynamic language change, "key" property with same "locale" info must be added
					// see: https://github.com/yahoo/react-intl/wiki/Components#multiple-intl-contexts
					key={languageWithoutRegionCode}
					defaultLocale={DEFAULT_LANGUAGE}
					locale={languageWithoutRegionCode}
					messages={messages[languageWithoutRegionCode]}
				>
					<div>
						<DummyComponentToExportProps />
						{this.props.children}
					</div>
				</IntlProvider>
	}
}

export { translate, translateHtml, translatePlural, translateNumber }

export default connect(
    // mapStateToProps
    (state, ownProps) => {
		const locale = state.user.get('locale')
        return {
            ...ownProps,
            locale
        }
    }
)(Translator)
