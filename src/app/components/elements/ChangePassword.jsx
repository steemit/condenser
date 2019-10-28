/* eslint react/prop-types: 0 */
import React from 'react';
import tt from 'counterpart';
import { Link } from 'react-router';

class ChangePassword extends React.Component {
    render() {
        return (
            <div>
                <Link to={`${$STM_Config.wallet_url}`}>Visit Wallet</Link>
            </div>
        );
    }
}

export default ChangePassword;
