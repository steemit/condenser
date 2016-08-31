import React from 'react';
import isString from 'lodash/isString';
import isObject from 'lodash/isObject';
import isUndefined from 'lodash/isUndefined';
import { IntlProvider, addLocaleData, injectIntl } from 'react-intl';

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
addLocaleData([...enLocaleData, ...ruLocaleData]);

// Our translated strings
import { en } from './locales/en';
import { ru } from './locales/ru';
const messages = Object.assign(en, ru)

// exported function placeholders
// this is needed for proper export before react-intl functions with locale data,
// will be properly created (they depend on react props and context,
// which is not available until component is being created)
let translate = () => {};
let translateHtml = () => {};

// react-intl's formatMessage and formatHTMLMessage functions depend on context(this is where strings are stored)
// thats why we:
// 1) create instance of <IntlProvider /> which wraps our application and creates react context (see "Translator" component below)
// 2) create <DummyComponentToExportProps /> inside <IntlProvider /> (the "Translator" component)
// 3) now we have proper context which we use to export translate() and translateHtml() to be used anywhere
// all of this shenanigans are needed because many times translations are needed outside of components(in reducers and redux "connect" functions)
// but since react-intl functions depends on components context it would be not possible

@injectIntl // inject translation functions through 'intl' prop
class DummyComponentToExportProps extends React.Component {

	render() { // render hidden placeholder
		return <span hidden>{' '}</span>
	}

	// assign functons on mount
	componentDidMount() {
		translate = 	(...params) => this.translateHandler('string', ...params)
		translateHtml = (...params) => this.translateHandler('html', ...params)
	}

	translateHandler(translateType, id, values, options) {
		const 	{ formatMessage, formatHTMLMessage } = this.props.intl,
				// choose which method of rendering to choose: normal string or string with html
				handler = translateType == 'string' ? formatMessage : formatHTMLMessage
		// check if right parameters were used before running function
		if (isString(id)) {
			if (!isUndefined(values) && !isObject(values)) throw new Error('translating function second parameter must be an object!');
			// map parameters for react-intl,
			// which uses formatMessage({id: 'stringId', values: {some: 'values'}, options: {}}) structure
			else return handler({id}, values, options)
		}
		else throw new Error('translating function first parameter must be a string!');
	}
}

// actual wrapper for application
class Translator extends React.Component {
	render() {
        /* LANGUAGE PICKER */
		// Problem: "navigator" is not defined while rendering on server side
		// "try/catch" and "if" constructs do not work, this is the workaround
		if (!global.navigator) global.navigator = {language: ''}

        // Define user's language. Different browsers have the user locale defined
        // on different fields on the `navigator` object, so we make sure to account
        // for these different by checking all of them
	    const language = 	navigator ? (navigator.languages && navigator.languages[0])
	                        || navigator.language
	                        || navigator.userLanguage : '';
        //Split locales with a region code (ie. 'en-EN' to 'en')
        const languageWithoutRegionCode = language.toLowerCase().split(/[_-]+/)[0];

		return 	<IntlProvider locale={languageWithoutRegionCode} messages={messages}>
					<div>
						{this.props.children}
						<DummyComponentToExportProps />
					</div>
				</IntlProvider>
	}
}

export { translate, translateHtml }

export default Translator
