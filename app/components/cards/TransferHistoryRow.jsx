import React from 'react';
import { Link } from 'react-router';
import TimeAgoWrapper from 'app/components/elements/TimeAgoWrapper';
import Tooltip from 'app/components/elements/Tooltip';
// import Icon from 'app/components/elements/Icon';
import Memo from 'app/components/elements/Memo'
import {numberWithCommas, vestsToSp} from 'app/utils/StateFunctions'

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
                    description_start += "Transfer " + data.amount.split(' ')[0] + " to STEEM POWER";
                }
                else {
                    description_start += "Transfer " + data.amount.split(' ')[0] + " STEEM POWER to ";
                    other_account = data.to;
                }
            }
            else if( data.to === context ) {
                description_start += "Receive " + data.amount.split(' ')[0] + " STEEM POWER from ";
                other_account = data.from;
            } else {
                description_start += "Transfer " + data.amount.split(' ')[0] + " STEEM POWER from " + data.from + " to ";
                other_account = data.to;
            }
        }
        else if( type === 'transfer' ) {
            if( data.from === context ) {
                description_start += "Transfer " + data.amount + " to ";
                other_account = data.to;
            }
            else if( data.to === context ) {
                description_start += "Receive " + data.amount + " from ";
                other_account = data.from;
            } else {
                description_start += "Transfer " + data.amount + " from ";
                other_account = data.from;
                description_end += " to " + data.to;
            }
        } else if( type === 'withdraw_vesting' ){
            if( data.vesting_shares === '0.000000 VESTS' )
                description_start += "Stop power down";
            else
                description_start += "Start power down of " + data.vesting_shares;
        } else if( type === 'curation_reward' ) {
            description_start += `Curation reward of ${curation_reward} STEEM POWER for `;
            other_account = data.comment_author;
            description_end = `/${data.comment_permlink}`;
        } else if (type === 'author_reward') {
            description_start += `Author reward of ${renameToSd(data.sbd_payout)} and ${author_reward} STEEM POWER for ${data.author}/${data.permlink}`;
            // other_account = ``;
            description_end = '';
        } else if (type === 'interest') {
            description_start += `Receive interest of ${data.interest}`;
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
