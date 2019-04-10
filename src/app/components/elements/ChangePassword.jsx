/* eslint react/prop-types: 0 */
import React from 'react';
import tt from 'counterpart';
import { Link } from 'react-router';

class ChangePassword extends React.Component {
    render() {
        return (
            <div>
                {tt('g.external_link_message')}
                {': '}
                <Link to={`${$STM_Config.wallet_url}/market`}>
                    {tt('navigation.currency_market')}
                </Link>
            </div>
        );
    }
}

export default reduxForm()(ChangePassword);
