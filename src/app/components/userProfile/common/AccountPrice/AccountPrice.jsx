import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled from 'styled-components';
import CollapsingCard from 'golos-ui/CollapsingCard';
import { vestsToGolos } from 'app/utils/StateFunctions';
import { formatCurrency } from 'src/app/helpers/currency';

const Body = styled.div`
    height: 103px;
    padding: 0 14px;
    line-height: 102px;
    text-align: center;
    font-size: ${props => props.fontSize}px;
    font-weight: bold;
    white-space: nowrap;
    color: #3684ff;
    overflow: hidden;
    text-overflow: ellipsis;
`;

class AccountPrice extends PureComponent {
    static propTypes = {
        accountName: PropTypes.string.isRequired,
    };

    componentWillReceiveProps(newProps) {
        if (this.props.rates !== newProps.rates) {
            this._rates = newProps.rates.toJS();
        }

        if (this.props.globalProps !== newProps.globalProps) {
            this._globalProps = newProps.globalProps.toJS();
        }
    }

    render() {
        const { golos, golosSafe, gold, goldSafe, power } = this.props;
        const rates = this._rates;

        let currency = 'GBG';

        if (process.env.BROWSER) {
            currency = localStorage.getItem('xchange.picked') || 'GBG';

            if (currency !== 'GBG' && !rates.GOLOS[currency]) {
                currency = 'GBG';
            }
        }

        const golosRate = rate(rates, 'GOLOS', currency);
        const gbgRate = rate(rates, 'GBG', currency);

        let sum = 0;

        sum += parseFloat(golos) * golosRate || 0;
        sum += parseFloat(golosSafe) * golosRate || 0;
        sum += parseFloat(gold) * gbgRate || 0;
        sum += parseFloat(goldSafe) * gbgRate || 0;
        sum += parseFloat(vestsToGolos(power, this._globalProps)) * golosRate || 0;

        const sumString = formatCurrency(sum, currency, 'adaptive');

        return (
            <CollapsingCard title={'Стоимость аккаунта'} saveStateKey="price">
                <Body fontSize={Math.floor(48 * (8 / sumString.length))}>{sumString}</Body>
            </CollapsingCard>
        );
    }
}

export default connect((state, props) => {
    const account = state.global.getIn(['accounts', props.accountName]);

    return {
        golos: account.get('balance').split(' ')[0],
        golosSafe: account.get('savings_balance').split(' ')[0],
        gold: account.get('sbd_balance').split(' ')[0],
        goldSafe: account.get('savings_sbd_balance').split(' ')[0],
        power: account.get('vesting_shares'),
        rates: state.global.get('rates'),
        globalProps: state.global.get('props'),
    };
})(AccountPrice);

function rate(rates, from, to) {
    if (from === to) {
        return 1;
    } else {
        return rates[from][to];
    }
}
