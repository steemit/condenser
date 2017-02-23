import React from 'react';
import { Link } from 'react-router';
import TimeAgoWrapper from 'app/components/elements/TimeAgoWrapper';
import Tooltip from 'app/components/elements/Tooltip';
// import Icon from 'app/components/elements/Icon';
import Memo from 'app/components/elements/Memo'
import {numberWithCommas, vestsToSp} from 'app/utils/StateFunctions'
import { translate } from 'app/Translator';
import { APP_NAME, DEBT_TOKEN, DEBT_TOKEN_SHORT, LIQUID_TOKEN, CURRENCY_SIGN, VESTING_TOKEN, VEST_TICKER } from 'config/client_config';

class TransferHistoryRow extends React.Component {

    render() {
        const {op, context, curation_reward, author_reward} = this.props
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
            const amount = data.amount && data.amount.split && data.amount.split(' ')[0]
            if( data.from === context ) {
                if( data.to === "" ) {
                    description_start += translate('transfer_amount_to_VESTING_TOKEN', { amount });
                }
                else {
                    description_start += translate('transfer_amount_steem_power_to', { amount }) + ' ';
                    other_account = data.to;
                }
            }
            else if( data.to === context ) {
                description_start += translate('recieve_amount_VESTING_TOKEN_from', { amount }) + ' ';
                other_account = data.from;
            } else {
                description_start += translate('transfer_amount_steem_power_from_to', { amount, from: data.from }) + ' ';
                other_account = data.to;
            }
        }
        else if(/^transfer$|^transfer_to_savings$|^transfer_from_savings$/.test(type)) {
            // transfer_to_savings
            // const fromWhere =
            //     type === 'transfer_to_savings' ? `to savings ` :
            //     type === 'transfer_from_savings' ? `from savings ` :
            //     ''

            // if( data.from === context ) {
            //     description_start += `Transfer ${fromWhere}${data.amount} to `;
            //     other_account = data.to;
            // }
            // else if( data.to === context ) {
            //     description_start += `Receive ${fromWhere}${data.amount} from `;
            //     other_account = data.from;
            // } else {
            //     description_start += `Transfer ${fromWhere}${data.amount} from `;
            //     other_account = data.from;
            //     description_end += " to " + data.to;
            // }
            // if(data.request_id != null)
            //     description_end += ` (request ${data.request_id})`

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
        } else if (type === 'cancel_transfer_from_savings') {
            description_start += translate('сancel_transfer_from_savings', { request: data.request_id });
        } else if( type === 'withdraw_vesting' ) {
            // if( data.vesting_shares === '0.000000 VESTS' )
            //     description_start += "Stop power down";
            // else
            //     description_start += "Start power down of " + data.vesting_shares;
            if( data.vesting_shares === '0.000000 ' + VEST_TICKER )
                description_start += translate('stop_power_down')
            else
                description_start += translate('start_power_down_of') + " " + data.vesting_shares;
        } else if( type === 'curation_reward' ) {
            // description_start += `${curation_reward} STEEM POWER for `;
            // other_account = data.comment_author + "/" + data.comment_permlink;
            description_start += translate('curation_reward_of_VESTING_TOKEN_for', { reward: curation_reward }) + ' ';
            other_account = data.comment_author;
            description_end = `/${data.comment_permlink}`;
        } else if (type === 'author_reward') {
            // let steem_payout = ""
            // if(data.steem_payout !== '0.000 STEEM') steem_payout = ", " + data.steem_payout;
            // description_start += `${renameToSd(data.sbd_payout)}${steem_payout}, and ${author_reward} STEEM POWER for ${data.author}/${data.permlink}`;
            // // other_account = ``;
            // description_end = '';
            description_start += translate('author_reward_of_VESTING_TOKEN_for', {
                payout: renameToSd(data.sbd_payout),
                reward: author_reward
            }) + ` ${data.author}/${data.permlink}`;
            // other_account = ``;
            description_end = '';
        } else if (type === 'interest') {
            description_start += translate('recieve_interest_of', { interest: data.interest });
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
                    <td className="TransferHistoryRow__text" style={{maxWidth: "40rem"}}>
                        {description_start}
                        {other_account && <Link to={`/@${other_account}`}>{other_account}</Link>}
                        {description_end}
                    </td>
                    <td className="show-for-medium" style={{maxWidth: "40rem"}}>
                        <Memo text={data.memo} username={context} />
                    </td>
                </tr>
        );
    }
};

// TODO: check this
const renameToSd = (txt) => txt ? numberWithCommas(txt.replace('SBD', DEBT_TOKEN_SHORT)) : txt

import {connect} from 'react-redux'
export default connect(
    // mapStateToProps
    (state, ownProps) => {
        const op = ownProps.op
        const type = op[1].op[0]
        const data = op[1].op[1]
        const curation_reward = type === 'curation_reward' ? numberWithCommas(vestsToSp(state, data.reward)) : undefined
        const author_reward = type === 'author_reward' ? numberWithCommas(vestsToSp(state, data.vesting_payout)) : undefined
        return {
            ...ownProps,
            curation_reward,
            author_reward,
        }
    },
)(TransferHistoryRow)
