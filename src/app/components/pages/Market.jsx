import React from 'react';
import { Link } from 'react-router';
import tt from 'counterpart';

class Market extends React.Component {
    render() {
        return (
            <div className="row">
                <div className="column">
                    {tt('g.external_link_message')}
                    {': '}
                    <Link to={`${$STM_Config.wallet_url}/market`}>
                        {tt('navigation.currency_market')}
                    </Link>
                </div>
            </div>
        );
    }
}
module.exports = {
    path: 'market',
    component: Market,
};
