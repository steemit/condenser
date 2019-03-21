import React, { Component } from 'react';
import { connect } from 'react-redux';

class SteemMarket extends Component {
    render() {
        const steemMarketData = this.props.steemMarketData;
        const topCoins = steemMarketData.get('top_coins');
        const steem = steemMarketData.get('steem');
        const sbd = steemMarketData.get('sbd');

        return (
            <div className="steem-market">
                <ul>
                    <li>{`STEEM ${steem.getIn([
                        'timepoints',
                        0,
                        'price_usd',
                    ])}`}</li>
                    <li>{`SBD ${steem.getIn([
                        'timepoints',
                        0,
                        'price_usd',
                    ])}`}</li>
                    {topCoins.map(coin => {
                        const name = coin.get('name');
                        const priceUsd = coin.getIn([
                            'timepoints',
                            0,
                            'price_usd',
                        ]);
                        return <li key={name}>{`${name} ${priceUsd}`}</li>;
                    })}
                </ul>
            </div>
        );
    }
}

export default connect(
    // mapStateToProps
    (state, ownProps) => {
        const steemMarketData = state.app.get('steemMarket');
        return {
            ...ownProps,
            steemMarketData,
        };
    },
    // mapDispatchToProps
    dispatch => ({})
)(SteemMarket);
