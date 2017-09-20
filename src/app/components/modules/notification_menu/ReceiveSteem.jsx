import React from 'react';

import { Link } from 'react-router'
import tt from 'counterpart'
import Userpic from 'app/components/elements/Userpic'
import TimeAgoWrapper from 'app/components/elements/TimeAgoWrapper'

export default class NotificationPostReply extends React.Component {

    render() {
        const amount = this.props.amount
        const author = this.props.author
        const created = this.props.created
        const classNames = (this.props.read)? '' : 'unread'

        const link = this.props.account_link + "/transfers"

        return <Link href={ link } className={ classNames }>
            <div className="item-panel" >
                <div className="Comment__Userpic show-for-medium">
                    <Userpic account={ author } />
                </div>
                <div className="item-header">
                    <span className="subject">{ amount } { tt("g.steem") }</span> { tt("notifications.receiveSteem.action") } <span className="user">{ author }</span>
                </div>
                <div className="item-footer">
                    <TimeAgoWrapper date={created} className="updated" />
                </div>
            </div>
        </Link>
    }
}
