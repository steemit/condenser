import React from 'react';
import { Link } from 'react-router';
import TimeAgoWrapper from 'app/components/elements/TimeAgoWrapper';
import Tooltip from 'app/components/elements/Tooltip';
// import Icon from 'app/components/elements/Icon';
import Memo from 'app/components/elements/Memo'
import {numberWithCommas, vestsToSp} from 'app/utils/StateFunctions'
import { translate } from '../../Translator';

class TransferHistoryRow extends React.Component {

    render() {
        const {op, context, curate_reward, comment_reward} = this.props
        // context -> account perspective

        let type = op[1].op[0];
        let data = op[1].op[1];

        let deposit = null;
        let withdraw = null;

        if( data.from !== context )
            deposit = data.amount;

        if( data.to !== context )
            withdraw = data.amount;

        /*  all transfers involve up to 2 accounts, context and 1 other. */
        let description_start = ""
        let other_account = null;
        let description_end = "";

        if( type === 'transfer_to_vesting' ) {
            if( data.from === context ) {
                const amount = data.amount.split(' ')[0]
                if( data.to === "" ) {
                    description_start += translate('transfer_amount_to_steem_power', { amount });
                }
                else {
                    description_start += translate('transfer_amount_steem_power_to', { amount }) + ' ';
                    other_account = data.to;
                }
            }
            else if( data.to === context ) {
                description_start += translate('recieve_amount_steem_power_from', { amount }) + ' ';
                other_account = data.from;
            } else {
                description_start += translate('transfer_amount_steem_power_from_to', {
                    amount,
                    from: data.from
                }) + ' ';
                other_account = data.to;
            }
        }
        else if( type === 'transfer' ) {
            const { amount } = data
            if( data.from === context ) {
                description_start += translate('transfer_amount_to', {amount}) + ' ';
                other_account = data.to;
            }
            else if( data.to === context ) {
                description_start += translate('recieve_amount_from', {amount}) + ' ';
                other_account = data.from;
            } else {
                description_start += translate('transfer_amount_from', {amount});
                other_account = data.from;
                description_end += ` ${translate('to')} ${data.to}`;
            }
        } else if( type === 'withdraw_vesting' ) {
            if( data.vesting_shares === '0.000000 VESTS' )
                description_start += translate('stop_power_down')
            else
                description_start += translate('start_power_down_of') + " " + data.vesting_shares;
        } else if( type === 'curate_reward' ) {
            description_start += translate('curation_reward_of_steem_power_for', { reward: curate_reward }) + ' ';
            other_account = data.comment_author;
            description_end = `/${data.comment_permlink}`;
        } else if (type === 'comment_reward') {
            description_start += translate('author_reward_of_steem_power_for', {
                payout: renameToSd(data.sbd_payout),
                reward: comment_reward
            }) + ` ${data.author}/${data.permlink}`;
            // other_account = ``;
            description_end = '';
        } else if (type === 'interest') {
            description_start += translate('recieve_interest_of', {
                interest: data.interest
            });
        } else {
            description_start += JSON.stringify({type, ...data}, null, 2);
        }
                            // <Icon name="clock" className="space-right" />
        return(
                <tr key={op[0]} className="Trans">
                    <td>
                        <Tooltip t={new Date(op[1].timestamp).toLocaleString()}>
                            <TimeAgoWrapper date={op[1].timestamp} />
                        </Tooltip>
                    </td>
                    <td className="TransferHistoryRow__text">
                        {description_start}
                        {other_account && <Link to={`/@${other_account}`}>{other_account}</Link>}
                        {description_end}
                    </td>
                    <td className="show-for-medium">
                        <Memo text={data.memo} username={context} />
                    </td>
                </tr>
        );
    }
};

const renameToSd = (txt) => txt ? numberWithCommas(txt.replace('SBD', 'SD')) : txt

import {connect} from 'react-redux'
export default connect(
    // mapStateToProps
    (state, ownProps) => {
        const op = ownProps.op
        const type = op[1].op[0]
        const data = op[1].op[1]
        const curate_reward = type === 'curate_reward' ? numberWithCommas(vestsToSp(state, data.reward)) : undefined
        const comment_reward = type === 'comment_reward' ? numberWithCommas(vestsToSp(state, data.vesting_payout)) : undefined
        return {
            ...ownProps,
            curate_reward,
            comment_reward,
        }
    },
)(TransferHistoryRow)
