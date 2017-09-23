import React from 'react';

import { Link } from 'react-router'
import tt from 'counterpart'
import Userpic from 'app/components/elements/Userpic'
import TimeAgoWrapper from 'app/components/elements/TimeAgoWrapper'

export default class NotificationPostReply extends React.Component {

    render() {
        const author = this.props.author
        const post = this.props.item
        const created = this.props.created
        const classNames = (this.props.read)? '' : 'unread'

        const link = ['', post.category, '@' + post.author, post.permlink].join('/')

        return <Link href={ link } className={ classNames }>
            <div className="item-panel" >
                <div className="Comment__Userpic show-for-medium">
                    <Userpic account={ author } />
                </div>
                <div className="item-header">
                    <span className="user">{ author }</span> { tt("notifications.resteem.action") }
                </div>
                <div className="item-content" >
                    { post.summary }
                </div>
                <div className="item-footer">
                    <TimeAgoWrapper date={created} className="updated" />
                </div>
            </div>
        </Link>
    }
}
