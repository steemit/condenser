/* eslint react/prop-types: 0 */
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import tt from 'counterpart';
import {
    numberWithCommas,
    vestingSteem,
    delegatedSteem,
} from 'app/utils/StateFunctions';
import Tooltip from 'app/components/elements/Tooltip';
import { FormattedHTMLMessage } from 'app/Translator';

class UserWallet extends React.Component {
    render() {
        const { account, gprops } = this.props;

        // do not render if account is not loaded or available
        if (!account) return null;

        // do not render if state appears to contain only lite account info
        if (!account.has('vesting_shares')) return null;

        let vesting_steem = vestingSteem(account.toJS(), gprops);
        let delegated_steem = delegatedSteem(account.toJS(), gprops);

        const steem_balance_str = numberWithCommas(balance_steem.toFixed(3));
        const power_balance_str = numberWithCommas(vesting_steem.toFixed(3));
        const received_power_balance_str =
            (delegated_steem < 0 ? '+' : '') +
            numberWithCommas((-delegated_steem).toFixed(3));

        return (
            <div className="UserWallet">
                <div className="UserWallet__balance row zebra">
                    <div className="column small-12 medium-8">
                        STEEM POWER
                        {delegated_steem != 0 ? (
                            <span className="secondary">
                                {tt(
                                    'tips_js.part_of_your_steem_power_is_currently_delegated',
                                    { user_name: account.get('name') }
                                )}
                            </span>
                        ) : null}
                    </div>
                    <div className="column small-12 medium-4">
                        {power_balance_str + ' STEEM'}
                        {delegated_steem != 0 ? (
                            <div>
                                <Tooltip t="STEEM POWER delegated to/from this account">
                                    ({received_power_balance_str} STEEM)
                                </Tooltip>
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        );
    }
}

export default connect(
    // mapStateToProps
    (state, ownProps) => {
        const gprops = state.global.get('props');
        return {
            ...ownProps,
            gprops: state.global.get('props').toJS(),
        };
    }
)(UserWallet);
