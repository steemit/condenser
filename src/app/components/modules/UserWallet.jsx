/* eslint react/prop-types: 0 */
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import tt from 'counterpart';

class UserWallet extends React.Component {
    render() {
        const { account, walletUrl } = this.props;
        if (!account) return null;

        return (
            <div className="UserWallet">
                <div className="wallet-link row zebra">
                    <p>
                        <a href={walletUrl}>Go to wallet</a>
                    </p>
                </div>
            </div>
        );
    }
}

export default connect(
    // mapStateToProps
    (state, ownProps) => {
        const walletUrl = state.app.get('walletUrl');
        return {
            walletUrl,
            ...ownProps,
        };
    }
)(UserWallet);
