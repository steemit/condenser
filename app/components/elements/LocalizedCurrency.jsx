import React from 'react';
import store from 'store';
import cc from 'currency-codes';
import { injectIntl } from 'react-intl';


let localizedCurrency = () => {}

// TODO add comments on what this code does

// TODO remove injectIntl, create formatNumber function in Translator
@injectIntl
export default class LocalizedCurrency extends React.Component {
	static propTypes = { amount: React.PropTypes.number.isRequired }

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
		console.warn('fetchExchangeRates is called!')
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
		const {amount, intl: {formatNumber}} = this.props
		const style = 'currency'


		// depending on exchange rates data parse local currency or dollars
		localizedCurrency = (number) => exchangeRate
										? formatNumber(number * exchangeRate, {style, currency})
										: formatNumber(number, {style, currency})

		return 	<span>
					{localizedCurrency(amount)}
					{/* {
						exchangeRate
						? formatNumber(amount * exchangeRate, {style, currency})
						: formatNumber(amount, {style, currency})
					} */}
				</span>
	}
}

export { localizedCurrency }
