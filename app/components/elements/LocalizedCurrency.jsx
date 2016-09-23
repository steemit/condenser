import React from 'react';
import store from 'store';
import cc from 'currency-codes';
import { injectIntl } from 'react-intl';
import { getSymbolFromCurrency } from 'currency-symbol-map';

let localCurrencySymbol
let localizedCurrency = () => {}

// TODO add comments on what this code does
// TODO add decimal symbols property
// TODO remove injectIntl, create formatNumber function in Translator
@injectIntl
export default class LocalizedCurrency extends React.Component {

	static propTypes = {
		amount: React.PropTypes.number.isRequired,
		noSymbol: React.PropTypes.bool
	}

	// static defaultProps = { noSymbol: false } // is this needed?

	state = {
		exchangeRate: store.get('exchangeRate'),
		currency: store.get('currency') || 'USD'
	}

	// on mount check if data is fresh and fetch it if needed
	componentDidMount() {
		if (process.env.BROWSER) {
			const oneDay = 1000 * 60 * 60 * 24
			const exchangeRateDate = store.get('exchangeRateDate')
			if (!exchangeRateDate || Date.now() - exchangeRateDate > oneDay) {
				this.fetchExchangeRates()
			}
		}
	}

	// fetch exchange rates and users country. Store data in localStorage
	fetchExchangeRates = () => {
		console.warn('exchange rates are outdated!')
		console.info('fetching new ones...')
		// get users country by ip
		fetch('http://freegeoip.net/json/')
			.then(function(response) {
				if (response.status >= 400) {
					throw new Error("Bad response from server");
				}
				return response.json()
			})
			.then(data => {
				const currency = cc.country( data.country_name.toLowerCase() )[0].code
				store.set('currency', currency)
				this.setState({currency})
				console.info('fetched exchange rates successfully!')
			})
			.catch(err => console.error('Failed to get users loaction info', err))

		// fetch exchange rates
		fetch('https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.xchange%20where%20pair%20in%20(%22' + 'USD' + this.state.currency + '%22)&format=json&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=')
			.then(function(data) { return data.json() })
			.then(data => {
				const exchangeRate = data.query.results.rate.Rate
				store.set('exchangeRateDate', Date.now())
				store.set('exchangeRate', exchangeRate)
				this.setState({ exchangeRate })
			})
			.catch(error => { console.error('LocalizedCurrency request failed', error) })
	}

	render() {
		const {currency, exchangeRate} 	 = this.state
		const {amount, intl: {formatNumber}, noSymbol} = this.props

		localCurrencySymbol = getSymbolFromCurrency(currency)

		/**
		 * localyze currency
		 * @param  {number} amount to parse
		 * @param  {object} options
		 * @return {string}
		 */
		// depending on exchange rates data parse local currency or default one
		localizedCurrency = (number, options) => {
			const currencyAmount = 	exchangeRate
										? formatNumber(number * exchangeRate)
										: formatNumber(number)
			// if noSymbol is specified return only amount of digits
			return 	noSymbol || options && options.noSymbol
					? currencyAmount
					: localCurrencySymbol + ' ' + currencyAmount
		}

		return 	<span {...this.props}>{localizedCurrency(amount)}</span>
	}
}

export { localizedCurrency, localCurrencySymbol }
