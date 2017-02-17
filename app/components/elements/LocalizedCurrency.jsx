import React from 'react';
import store from 'store';
// import cc from 'currency-codes';
import { injectIntl } from 'react-intl';
import { getSymbolFromCurrency } from 'currency-symbol-map';
import { FRACTION_DIGITS, DEFAULT_CURRENCY } from 'config/client_config';

let localizedCurrency = () => {}
const localCurrencySymbol = process.env.BROWSER ? getSymbolFromCurrency(store.get('currency') || DEFAULT_CURRENCY) : ''

// TODO refactor. This is a mess
// TODO add comments on what this code does
// TODO remove injectIntl, create formatNumber function in Translator
@injectIntl
export default class LocalizedCurrency extends React.Component {

	static propTypes = {
		noSymbol: React.PropTypes.bool,
		fractionDigits: React.PropTypes.number,
		amount: React.PropTypes.number.isRequired
	}

	static defaultProps = {
		noSymbol: false,
		fractionDigits: FRACTION_DIGITS
	}

	state = {
		exchangeRate: store.get('exchangeRate'),
		goldExchangeRate: store.get('goldExchangeRate'),
		currency: store.get('currency') || DEFAULT_CURRENCY,
		localCurrencySymbol: getSymbolFromCurrency(store.get('currency') || DEFAULT_CURRENCY)
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

	// TODO move this into redux
	checkIfCurrencyChanged = () => {
		if (process.env.BROWSER) {
			// fetch new exchange data if:
			// currency has changed
			if(this.state.currency != store.get('fetchedCurrency')) this.fetchExchangeRates()
			// if currency rates are not fetched at all
			if (!store.get('goldExchangeRate') || !store.get('exchangeRate')) this.fetchExchangeRates()
		}
	}

	// fetch exchange rates and users country. Store data in localStorage
	fetchExchangeRates = () => {
		console.warn('exchange rates are outdated!')
		console.info('fetching new ones...')
		const {currency} = this.state
		// TODO rework this to accept only allowed countries (russia, ukraine and so on)
		// get users country by ip
		// fetch('http://freegeoip.net/json/')
		// 	.then(function(response) {
		// 		if (response.status >= 400) {
		// 			throw new Error("Bad response from server");
		// 		}
		// 		return response.json()
		// 	})
		// 	.then(data => {
		// 		const currency = cc.country( data.country_name.toLowerCase() )[0].code
		// 		store.set('fetchedCurrency', currency)
		// 		// store.set('currency', currency)
		// 		this.setState({currency})
		// 		console.info('fetched exchange rates successfully!')
		// 	})
		// 	.catch(err => console.error('Failed to get users loaction info', err))

		// fetch exchange rates GOLD to USD exchange rates
		fetch('https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.xchange%20where%20pair%20in%20(%22' + 'XAU' + 'USD' + '%22)&format=json&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=')
			.then(function(data) { return data.json() })
			.then(data => {
				const goldExchangeRate = data.query.results.rate.Rate
				store.set('goldExchangeRate', goldExchangeRate)
				store.set('exchangeRateDateGold', Date.now())
				this.setState({ goldExchangeRate })
				console.info('Everything is fine, fetched GOLD properly')
			})
			.catch(error => {
				console.error('LocalizedCurrency request failed', error)
			})

		// fetch exchange rates of currently choosen currency
		fetch('https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.xchange%20where%20pair%20in%20(%22' + 'USD' + currency + '%22)&format=json&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=')
			.then(function(data) { return data.json() })
			.then(data => {
				const exchangeRate = data.query.results.rate.Rate
				store.set('exchangeRate', exchangeRate)
				store.set('exchangeRateDate', Date.now())
				store.set('fetchedCurrency', currency)
				this.setState({
					exchangeRate,
					localCurrencySymbol: getSymbolFromCurrency(currency)
				})
				console.info('Everything is fine, fetched CURRENCY properly')
			})
			.catch(error => {
				console.error('LocalizedCurrency request failed', error)
			})
	}

	render() {
		const {exchangeRate, goldExchangeRate} = this.state
		const {amount, intl: {formatNumber}, noSymbol, fractionDigits, ...rest} = this.props
		let {localCurrencySymbol} = this.state

		this.checkIfCurrencyChanged()

		/**
		 * localyze currency
		 * @param  {number} amount to parse
		 * @param  {object} options
		 * @return {string}
		 */
		// depending on exchange rates data parse local currency or default one
		localizedCurrency = (number, options) => {
			// const currencyAmount = 	formatNumber(
			// 							exchangeRate
			// 							// вознаграждение руб = Сумма Золотых х (Биржевая цена унции в USD / 31103.4768) * курс USD ЦБ РФ (или любая другая валюта)
			// 							? number * (goldExchangeRate / 31103.4768) * exchangeRate
			// 							: number,
			// 							options
			// 						)
			const currencyAmount = 	Number(
										exchangeRate
										// вознаграждение руб = Сумма Золотых х (Биржевая цена унции в USD / 31103.4768) * курс USD ЦБ РФ (или любая другая валюта)
										? number * (goldExchangeRate / 31103.4768) * exchangeRate
										: number
									).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
			// if noSymbol is specified return only amount of digits
			return 	noSymbol
					? currencyAmount
					: localCurrencySymbol + ' ' + currencyAmount
		}

		return 	<span {...rest}>
					{localizedCurrency(amount, {maximumFractionDigits: fractionDigits})}
				</span>
	}
}

export { localizedCurrency, localCurrencySymbol }

// PEACE OF SHEET
// import store from 'store';
// import { FRACTION_DIGITS, DEFAULT_CURRENCY, } from 'config/client_config';

// currencies_symbols = {
// 	RUB: '₽',
// 	UAH: '₴',
// 	BYN: 'BYN',
// 	USD: '$',
// 	EUR: '€',
// 	CNY: 'CN¥',
// 	GEL: 'GEL',
// 	KZT: 'тңг.',
// }
// let localCurrencySymbol = currencies_symbols[store.get('currency') || DEFAULT_CURRENCY];
// let localizedCurrency = (value) => Number(value).toLocaleString('en');

// export { localizedCurrency, localCurrencySymbol }
