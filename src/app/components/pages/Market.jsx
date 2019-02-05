import React from 'react';
import { Link } from 'react-router';
import tt from 'counterpart';

class Market extends React.Component {
    render() {
        return (
            <div>
                <div className="row">
                    <div className="column">
                        <Link to="https://steemit.com/">{tt('navigation.currency_market')}</Link>
                    </div>
                </div>
            </div>
        );
    }
}
module.exports = {
    path: 'market',
    component: Market,
};
