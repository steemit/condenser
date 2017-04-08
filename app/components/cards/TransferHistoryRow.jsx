import React from 'react';
import { Link } from 'react-router';
import TimeAgoWrapper from 'app/components/elements/TimeAgoWrapper';
// import Icon from 'app/components/elements/Icon';
import Memo from 'app/components/elements/Memo'
import {numberWithCommas, vestsToSp} from 'app/utils/StateFunctions'
import tt from 'counterpart';

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
            if( data.from === context ) {
                if( data.to === "" ) {
                    description_start += tt("transfer") + data.amount.split(' ')[0] + tt("to") + "STEEM POWER";
                }
                else {
                    description_start += tt("transfer") + data.amount.split(' ')[0] + " STEEM POWER" + tt("to");
                    other_account = data.to;
                }
            }
            else if( data.to === context ) {
                description_start += tt("recieve") + data.amount.split(' ')[0] + " STEEM POWER" + tt("from");
                other_account = data.from;
            } else {
                description_start += tt("transfer") + data.amount.split(' ')[0] + " STEEM POWER" + tt("from") + data.from + tt("to");
                other_account = data.to;
            }
        }
        else if(/^transfer$|^transfer_to_savings$|^transfer_from_savings$/.test(type)) {
            // transfer_to_savings
            const fromWhere =
                type === 'transfer_to_savings' ? tt("to_savings") :
                type === 'transfer_from_savings' ? tt("from_savings") :
                ''

            if( data.from === context ) {
                description_start += tt("transfer") + `${fromWhere} ${data.amount}` + tt("to");
                other_account = data.to;
            }
            else if( data.to === context ) {
                description_start += tt("receive") + `${fromWhere} ${data.amount}` + tt("from");
                other_account = data.from;
            } else {
                description_start += tt("transfer") + `${fromWhere} ${data.amount}` + tt("from");
                other_account = data.from;
                description_end += tt("to") + data.to;
            }
            if(data.request_id != null)
                description_end += ` (${tt('request')} ${data.request_id})`
        } else if (type === 'cancel_transfer_from_savings') {
            description_start += `${tt('cancel_transfer_from_savings')} (${tt('request')} ${data.request_id})`;
        } else if( type === 'withdraw_vesting' ) {
            if( data.vesting_shares === '0.000000 VESTS' )
                description_start += tt('stop_power_down');
            else
                description_start += tt('start_power_down_of') + data.vesting_shares;
        } else if( type === 'curation_reward' ) {
            description_start += `${curation_reward} STEEM POWER` + tt("for");
            other_account = data.comment_author + "/" + data.comment_permlink;
        } else if (type === 'author_reward') {
            let steem_payout = ""
            if(data.steem_payout !== '0.000 STEEM') steem_payout = ", " + data.steem_payout;
            description_start += `${renameToSd(data.sbd_payout)}${steem_payout}, ${tt("and")} ${author_reward} STEEM POWER ${tt("for")} ${data.author}/${data.permlink}`;
            // other_account = ``;
            description_end = '';
        } else if (type === 'interest') {
            description_start += `${tt('receive_interest_of')} ${data.interest}`;
        } else {
            description_start += JSON.stringify({type, ...data}, null, 2);
        }
                            // <Icon name="clock" className="space-right" />
        return(
                <tr key={op[0]} className="Trans">
                    <td>
                        <TimeAgoWrapper date={op[1].timestamp} />
                    </td>
                    <td className="TransferHistoryRow__text" style={{maxWidth: "40rem"}}>
                        {description_start}
                        {other_account && <Link to={`/@${other_account}`}>{other_account}</Link>}
                        {description_end}
                    </td>
                    <td className="show-for-medium" style={{maxWidth: "40rem", wordWrap: "break-word"}}>
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
        const curation_reward = type === 'curation_reward' ? numberWithCommas(vestsToSp(state, data.reward)) : undefined
        const author_reward = type === 'author_reward' ? numberWithCommas(vestsToSp(state, data.vesting_payout)) : undefined
        return {
            ...ownProps,
            curation_reward,
            author_reward,
        }
    },
)(TransferHistoryRow)
