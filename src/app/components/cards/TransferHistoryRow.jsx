import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import tt from 'counterpart';
import TimeAgoWrapper from 'app/components/elements/TimeAgoWrapper';
// import Icon from 'app/components/elements/Icon';
import Memo from 'app/components/elements/Memo';
import { numberWithCommas, vestsToSp } from 'app/utils/StateFunctions';
import BadActorList from 'app/utils/BadActorList';

class TransferHistoryRow extends React.Component {
    render() {
        const {
            op,
            context,
            curation_reward,
            author_reward,
            benefactor_reward,
            powerdown_vests,
            reward_vests,
        } = this.props;
        // context -> account perspective

        const type = op[1].op[0];
        const data = op[1].op[1];

        /*  all transfers involve up to 2 accounts, context and 1 other. */
        let description_start = '';
        let other_account = null;
        let description_end = '';

        if (type === 'transfer_to_vesting') {
            if (data.from === context) {
                if (data.to === '') {
                    description_start +=
                        tt('g.transfer') +
                        data.amount.split(' ')[0] +
                        tt('g.to') +
                        'STEEM POWER';
                } else {
                    description_start +=
                        tt('g.transfer') +
                        data.amount.split(' ')[0] +
                        ' STEEM POWER' +
                        tt('g.to');
                    other_account = data.to;
                }
            } else if (data.to === context) {
                description_start +=
                    tt('g.receive') +
                    data.amount.split(' ')[0] +
                    ' STEEM POWER' +
                    tt('g.from');
                other_account = data.from;
            } else {
                description_start +=
                    tt('g.transfer') +
                    data.amount.split(' ')[0] +
                    ' STEEM POWER' +
                    tt('g.from') +
                    data.from +
                    tt('g.to');
                other_account = data.to;
            }
        } else if (
            /^transfer$|^transfer_to_savings$|^transfer_from_savings$/.test(
                type
            )
        ) {
            // transfer_to_savings
            const fromWhere =
                type === 'transfer_to_savings'
                    ? tt('transferhistoryrow_jsx.to_savings')
                    : type === 'transfer_from_savings'
                      ? tt('transferhistoryrow_jsx.from_savings')
                      : '';

            if (data.from === context) {
                description_start +=
                    tt('g.transfer') +
                    `${fromWhere} ${data.amount}` +
                    tt('g.to');
                other_account = data.to;
            } else if (data.to === context) {
                description_start +=
                    tt('g.receive') +
                    `${fromWhere} ${data.amount}` +
                    tt('g.from');
                other_account = data.from;
            } else {
                description_start +=
                    tt('g.transfer') +
                    `${fromWhere} ${data.amount}` +
                    tt('g.from');
                other_account = data.from;
                description_end += tt('g.to') + data.to;
            }
            if (data.request_id != null)
                description_end += ` (${tt('g.request')} ${data.request_id})`;
        } else if (type === 'cancel_transfer_from_savings') {
            description_start += `${tt(
                'transferhistoryrow_jsx.cancel_transfer_from_savings'
            )} (${tt('g.request')} ${data.request_id})`;
        } else if (type === 'withdraw_vesting') {
            if (data.vesting_shares === '0.000000 VESTS')
                description_start += tt(
                    'transferhistoryrow_jsx.stop_power_down'
                );
            else
                description_start +=
                    tt('transferhistoryrow_jsx.start_power_down_of') +
                    ' ' +
                    powerdown_vests +
                    ' STEEM';
        } else if (type === 'curation_reward') {
            description_start += `${curation_reward} STEEM POWER` + tt('g.for');
            other_account = data.comment_author + '/' + data.comment_permlink;
        } else if (type === 'author_reward') {
            let steem_payout = '';
            if (data.steem_payout !== '0.000 STEEM')
                steem_payout = ', ' + data.steem_payout;
            description_start += `${data.sbd_payout}${steem_payout}, ${tt(
                'g.and'
            )} ${author_reward} STEEM POWER ${tt('g.for')}`;
            other_account = data.author + '/' + data.permlink;
            description_end = '';
        } else if (type === 'claim_reward_balance') {
            const rewards = [];
            if (parseFloat(data.reward_steem.split(' ')[0]) > 0)
                rewards.push(data.reward_steem);
            if (parseFloat(data.reward_sbd.split(' ')[0]) > 0)
                rewards.push(data.reward_sbd);
            if (parseFloat(data.reward_vests.split(' ')[0]) > 0)
                rewards.push(`${reward_vests} STEEM POWER`);

            let rewards_str;
            switch (rewards.length) {
                case 3:
                    rewards_str = `${rewards[0]}, ${rewards[1]} and ${
                        rewards[2]
                    }`;
                    break;
                case 2:
                    rewards_str = `${rewards[0]} and ${rewards[1]}`;
                    break;
                case 1:
                    rewards_str = `${rewards[0]}`;
                    break;
            }

            description_start += `Claim rewards: ${rewards_str}`;
            description_end = '';
        } else if (type === 'interest') {
            description_start += `${tt(
                'transferhistoryrow_jsx.receive_interest_of'
            )} ${data.interest}`;
        } else if (type === 'fill_convert_request') {
            description_start += `Fill convert request: ${data.amount_in} for ${
                data.amount_out
            }`;
        } else if (type === 'fill_order') {
            if (data.open_owner == context) {
                // my order was filled by data.current_owner
                description_start += `Paid ${data.open_pays} for ${
                    data.current_pays
                }`;
            } else {
                // data.open_owner filled my order
                description_start += `Paid ${data.current_pays} for ${
                    data.open_pays
                }`;
            }
        } else if (type === 'comment_benefactor_reward') {
            let steem_payout = '';
            if (data.steem_payout !== '0.000 STEEM')
                steem_payout = ', ' + data.steem_payout;
            description_start += `${benefactor_reward} STEEM POWER for ${
                data.author
            }/${data.permlink}`;
            description_end = '';
        } else {
            description_start += JSON.stringify({ type, ...data }, null, 2);
        }
        // <Icon name="clock" className="space-right" />
        return (
            <tr key={op[0]} className="Trans">
                <td>
                    <TimeAgoWrapper date={op[1].timestamp} />
                </td>
                <td
                    className="TransferHistoryRow__text"
                    style={{ maxWidth: '40rem' }}
                >
                    {description_start}
                    {other_account && (
                        <Link to={`/@${other_account}`}>{other_account}</Link>
                    )}
                    {description_end}
                </td>
                <td
                    className="show-for-medium"
                    style={{ maxWidth: '40rem', wordWrap: 'break-word' }}
                >
                    <Memo
                        text={data.memo}
                        username={context}
                        isFromBadActor={
                            BadActorList.indexOf(other_account) > -1
                        }
                    />
                </td>
            </tr>
        );
    }
}

export default connect(
    // mapStateToProps
    (state, ownProps) => {
        const op = ownProps.op;
        const type = op[1].op[0];
        const data = op[1].op[1];
        const powerdown_vests =
            type === 'withdraw_vesting'
                ? numberWithCommas(vestsToSp(state, data.vesting_shares))
                : undefined;
        const reward_vests =
            type === 'claim_reward_balance'
                ? numberWithCommas(vestsToSp(state, data.reward_vests))
                : undefined;
        const curation_reward =
            type === 'curation_reward'
                ? numberWithCommas(vestsToSp(state, data.reward))
                : undefined;
        const author_reward =
            type === 'author_reward'
                ? numberWithCommas(vestsToSp(state, data.vesting_payout))
                : undefined;
        const benefactor_reward =
            type === 'comment_benefactor_reward'
                ? numberWithCommas(vestsToSp(state, data.reward))
                : undefined;
        return {
            ...ownProps,
            curation_reward,
            author_reward,
            benefactor_reward,
            powerdown_vests,
            reward_vests,
        };
    }
)(TransferHistoryRow);
