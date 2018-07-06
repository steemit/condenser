import 'isomorphic-fetch';
import React from 'react';
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
// import cc from 'currency-codes';
// import { injectIntl } from 'react-intl';
import g from 'app/redux/GlobalReducer';
import { getSymbolFromCurrency } from 'currency-symbol-map';
import { FRACTION_DIGITS, DEFAULT_CURRENCY, DEBT_TOKEN_SHORT, LIQUID_TICKER, FRACTION_DIGITS_MARKET } from 'app/client_config';
import { short as shortAmount } from 'app/utils/FormatNumbers'
import LoadingIndicator from 'app/components/elements/LoadingIndicator';


class LocalizedCurrency extends React.Component {

  static propTypes = {
    fetching: PropTypes.bool,
    reloadExchangeRates: PropTypes.func.isRequired,
    noSymbol: PropTypes.bool,
    fractionDigits: PropTypes.number,
    amount: PropTypes.number.isRequired,
    currency: PropTypes.string,
    rounding: PropTypes.bool,
    short: PropTypes.bool,
  }

  static defaultProps = {
    noSymbol: false,
  }

  state = {
    xchangePair: 0,
    xchangeGold: 0,
    xchangePicked: DEBT_TOKEN_SHORT
  }

  componentDidMount() {
    this.setState({
      xchangePicked: this.props.currency ? this.props.currency : localStorage.getItem('xchange.picked') || DEBT_TOKEN_SHORT,
      xchangeGold: localStorage.getItem('xchange.gold') || 0,
      xchangePair: localStorage.getItem('xchange.pair') || 0
    })
  }

  componentWillReceiveProps(nextProps) {
    const {fetching} = this.props;
    if (fetching !== nextProps.fetching) {
      const xchangePicked = this.props.currency ? this.props.currency : localStorage.getItem('xchange.picked') || DEBT_TOKEN_SHORT;
      const xchangeGold = localStorage.getItem('xchange.gold') || 0;
      const xchangePair = localStorage.getItem('xchange.pair') || 0;
      this.setState({
        xchangePicked,
        xchangeGold,
        xchangePair
      })
    }
  }

  render() {
    const {xchangePicked, xchangeGold, xchangePair} = this.state;
    const {
      fetching,
      amount,
      noSymbol,
      fractionDigits,
      rounding,
      short,
      vesting_shares
    } = this.props

    if (! process.env.BROWSER
      || fetching
      || xchangePair === 0
      || xchangeGold === 0
    )
      return <LoadingIndicator type="little" />;

    let symbol = getSymbolFromCurrency(xchangePicked);
    if (typeof symbol == 'undefined') {
      if (xchangePicked == LIQUID_TICKER) {
        symbol = LIQUID_TICKER;
      } else {
        symbol = DEBT_TOKEN_SHORT;
      }
    }
    /**
     * localyze currency
     * @param  {number} amount to parse
     * @param  {object} options
     * @return {string}
     */
    // depending on exchange rates data parse local currency or default one
    localizedCurrency = (number, options) => {
      // const currencyAmount =   formatNumber(
      // exchangeRate
      // вознаграждение руб = Сумма Золотых х (Биржевая цена унции в USD / 31103.4768) * курс USD ЦБ РФ (или любая другая валюта)
      // ? number * (exchangeRateGold / 31103.4768) * exchangeRate
      // : number,
      // options
      // )
      let currencyAmount = 0;
      if (symbol.localeCompare(DEBT_TOKEN_SHORT) == 0) {
        currencyAmount = number;
      } else if (symbol.localeCompare(LIQUID_TICKER) == 0) {
        currencyAmount = number > 0 ? number / xchangePair : 0;
      } else {
        currencyAmount = number * (xchangeGold / 31103.4768) * xchangePair;
      }

      let lang, nRounding
      if(process.env.BROWSER) {
        lang = localStorage.getItem('language')
        if (!lang) {
          lang = ((navigator.languages && navigator.languages[0]) || navigator.language || navigator.userLanguage)
        }
        if (options && options.maximumFractionDigits) {
          nRounding = options.maximumFractionDigits
        } else {
          nRounding = localStorage.getItem('xchange.rounding')
          if(!nRounding) {
            if(vesting_shares < 10000000 && vesting_shares != 0) //FIXME this is vesting_shares param. Move to config file needed
              nRounding = FRACTION_DIGITS_MARKET
            else
              nRounding = FRACTION_DIGITS
          }
        }
      }

      if (options ? (options.short ? options.short : short) : short) {
        currencyAmount = shortAmount(currencyAmount)
      } else {
        if (options ? (options.rounding ? options.rounding : rounding ) : rounding) {
          let divider = Math.pow(10, (parseInt(Math.ceil(currencyAmount).toString().length) - 1))
          currencyAmount = (currencyAmount / divider | 0) * divider
        } else {
          currencyAmount = currencyAmount.toLocaleString(lang, {
            minimumFractionDigits: nRounding,
            maximumFractionDigits: nRounding
          })
        }
      }

      // if noSymbol is specified return only amount of digits
      return  (options ? (options.noSymbol ? options.noSymbol : noSymbol) : noSymbol)
        ? currencyAmount
        : (lang == 'en') ? (symbol + ' ' + currencyAmount) : (currencyAmount + ' ' + symbol)
    }

    return <span>{localizedCurrency(amount, { maximumFractionDigits: fractionDigits })}</span>
  }
}

export default connect(
  (state, ownProps) => {
    const current_account = state.user.get('current')
    const vesting_shares = current_account ? current_account.get('vesting_shares') : 0.0;
    const fetching = state.global.get('fetchingXchange');
    return {
      ...ownProps,
      fetching,
      vesting_shares
    };
  },
  dispatch => ({
    reloadExchangeRates: () => {
      dispatch(g.actions.fetchExchangeRates())
    }
  })
)(LocalizedCurrency)

let localizedCurrency = () => {}
export {localizedCurrency}
