import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { vestsToGolos } from 'app/utils/StateFunctions';
import { formatCurrency } from 'src/app/helpers/currency';

const Body = styled.div`
    height: 103px;
    padding: 0 14px;
    border-bottom: 1px solid #e9e9e9;
    line-height: 102px;
    text-align: center;
    font-size: ${props => props.fontSize}px;
    font-weight: bold;
    white-space: nowrap;
    color: #3684ff;
    overflow: hidden;
    text-overflow: ellipsis;
`;

function getRate(rates, from, to) {
    if (from === to) {
        return 1;
    } else {
        return rates[from][to];
    }
}

@connect((state, props) => {
    const account = state.global.getIn(['accounts', props.accountName]);
    const rates = state.data.rates.actual;

    let currency = state.data.settings.getIn(['basic', 'currency'], 'GBG');

    if (currency !== 'GBG' && !rates.GOLOS[currency]) {
        currency = 'GBG';
    }

    return {
        golos: account.get('balance').split(' ')[0],
        golosSafe: account.get('savings_balance').split(' ')[0],
        gold: account.get('sbd_balance').split(' ')[0],
        goldSafe: account.get('savings_sbd_balance').split(' ')[0],
        power: account.get('vesting_shares'),
        rates,
        globalProps: state.global.get('props'),
        currency,
    };
})
export default class AccountPrice extends PureComponent {
    static propTypes = {
        accountName: PropTypes.string.isRequired,
    };

    render() {
        const { golos, golosSafe, gold, goldSafe, power, currency, rates, globalProps } = this.props;

        const golosRate = getRate(rates, 'GOLOS', currency);
        const gbgRate = getRate(rates, 'GBG', currency);

        let sum = 0;

        sum += parseFloat(golos) * golosRate || 0;
        sum += parseFloat(golosSafe) * golosRate || 0;
        sum += parseFloat(gold) * gbgRate || 0;
        sum += parseFloat(goldSafe) * gbgRate || 0;
        sum += parseFloat(vestsToGolos(power, globalProps.toJS())) * golosRate || 0;

        const sumString = formatCurrency(sum, currency, 'adaptive');

        return (
            <Body fontSize={Math.floor(48 * (8 / sumString.length))}>{sumString}</Body>
        );
    }
}
