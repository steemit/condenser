import 'isomorphic-fetch';
import React from 'react';
// import cc from 'currency-codes';
import { injectIntl } from 'react-intl';
import { getSymbolFromCurrency } from 'currency-symbol-map';
import { FRACTION_DIGITS, DEFAULT_CURRENCY, CURRENCY_COOKIE_KEY } from 'app/client_config';
import cookie from "react-cookie";

let localizedCurrency = () => {}
const localCurrencySymbol = process.env.BROWSER ? getSymbolFromCurrency(cookie.load(CURRENCY_COOKIE_KEY) || DEFAULT_CURRENCY) : $GLS_Config.currency

const getExchangePairRateById = (id) => {
  for (var i in $GLS_Config.exRates) {
    if ($GLS_Config.exRates[i].id === id)
      return $GLS_Config.exRates[i].Rate
  }
  return null
}

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

    state = process.env.BROWSER ? {
        exchangeRate: localStorage.getItem('exchangeRate'),
        exchangeRateGold: localStorage.getItem('exchangeRateGold'),
        currency: cookie.load(CURRENCY_COOKIE_KEY) || DEFAULT_CURRENCY,
        localCurrencySymbol: getSymbolFromCurrency(process.env.BROWSER ? cookie.load(CURRENCY_COOKIE_KEY) || DEFAULT_CURRENCY : DEFAULT_CURRENCY)
    } : {
        exchangeRate: getExchangePairRateById(DEFAULT_CURRENCY + $GLS_Config.currency),
        exchangeRateGold: getExchangePairRateById('XAU' + DEFAULT_CURRENCY),
        currency: $GLS_Config.currency,
        localCurrencySymbol: getSymbolFromCurrency($GLS_Config.currency)
    }

    // on mount check if data is fresh and fetch it if needed
    componentDidMount() {
        if (process.env.BROWSER) {
            const oneDay = 1000 * 60 * 60 * 24
            const exchangeFetchDate = localStorage.getItem('exchangeFetchDate')
            if (!exchangeFetchDate || Date.now() - exchangeFetchDate > oneDay) {
                this.fetchExchangeRates()
            }
        }
    }

    // TODO move this into redux
    checkIfCurrencyChanged = () => {
        if (process.env.BROWSER) {
            // fetch new exchange data if:
            // currency has changed
            if(this.state.currency != localStorage.getItem('exchangeCurrency')) this.fetchExchangeRates()
            // if currency rates are not fetched at all
            if (!localStorage.getItem('exchangeRateGold') || !localStorage.getItem('exchangeRate')) this.fetchExchangeRates()
        }
        else {
            // console.log('GLS_Config', getExchangePairRateById(DEFAULT_CURRENCY + $GLS_Config.currency))
            // TODO: fetch currencies on server side, but store it on global variable like $GLS_Config / $STM_Config
            // fetch data with every user server request it's bad, need to store it global
        }
    }

    // fetch exchange rates and users country. Store data in localStorage
    fetchExchangeRates = () => {
        console.warn('exchange rates are outdated!')
        console.info('fetching new ones...')
        const {currency} = this.state
        // fetch exchange rates GOLD to USD exchange rates and rates of currently choosen currency
        fetch('https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.xchange%20where%20pair%3D%22' + 'XAU' + 'USD' + '%2C' + 'USD' + currency + '%22&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys')
            .then(function(data) { return data.json() })
            .then(data => {
                const exchangeRateGold = data.query.results.rate[0].Rate
                const exchangeRate = data.query.results.rate[1].Rate
                if (process.env.BROWSER) {
                    localStorage.setItem('exchangeRateGold', exchangeRateGold)
                    localStorage.setItem('exchangeRate', exchangeRate)
                    localStorage.setItem('exchangeCurrency', currency)
                    localStorage.setItem('exchangeFetchDate', Date.now())
                    this.setState({
                        exchangeRate,
                        exchangeRateGold,
                        localCurrencySymbol: getSymbolFromCurrency(currency)
                    })
                }
                console.info('Everything is fine, fetched exrates properly')
            })
            .catch(error => {
                console.error('LocalizedCurrency request failed', error)
            })

    }

    render() {
        const {exchangeRate, exchangeRateGold} = this.state
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
            // const currencyAmount =   formatNumber(
            //                          exchangeRate
            //                          // вознаграждение руб = Сумма Золотых х (Биржевая цена унции в USD / 31103.4768) * курс USD ЦБ РФ (или любая другая валюта)
            //                          ? number * (exchangeRateGold / 31103.4768) * exchangeRate
            //                          : number,
            //                          options
            //                      )
            const currencyAmount =  Number(
                                        exchangeRate
                                        // вознаграждение руб = Сумма Золотых х (Биржевая цена унции в USD / 31103.4768) * курс USD ЦБ РФ (или любая другая валюта)
                                        ? number * (exchangeRateGold / 31103.4768) * exchangeRate
                                        : number
                                    ).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            // if noSymbol is specified return only amount of digits
            return  noSymbol
                    ? currencyAmount
                    : localCurrencySymbol + ' ' + currencyAmount
        }

        return  <span {...rest}>
                    {localizedCurrency(amount, {maximumFractionDigits: fractionDigits})}
                </span>
    }
}

export { localizedCurrency, localCurrencySymbol }
