import React from 'react';
import { Link } from 'react-router'
import {connect} from 'react-redux'
import tt from 'counterpart'
import Userpic from 'app/components/elements/Userpic'
import TimeAgoWrapper from 'app/components/elements/TimeAgoWrapper'

class NotificationPostReply extends React.Component {
    constructor(notification, ...args) {
        super(notification, ...args)
        this.state = {
            id: notification.id
        }
    }

    markRead = (e) => {
        e.preventDefault()
        this.props.markRead(this.state.id)
    }

    render() {
        const author = this.props.author
        const post = this.props.rootItem
        const comment = this.props.item
        const created = this.props.created
        const classNames = (this.props.read)? '' : 'unread'

        console.log('author', author)

        const link = ['', post.category, '@' + post.author, post.permlink, '#@' + comment.author, comment.permlink].join('/')

        return <Link href={ link } className={ classNames } onClick={ this.markRead } >
            <div className="item-panel" >
                <div className="Comment__Userpic show-for-medium">
                    <Userpic account={ author } />
                </div>
                <div className="item-header">
                    <span className="user">{ author }</span> { tt("notifications.commentReply.action") }
                </div>
                <div className="item-content" >
                    { comment.parentSummary }
                </div>
                <div className="item-footer">
                    <TimeAgoWrapper date={created} className="updated" />
                </div>
            </div>
        </Link>
    }
}

export default connect(
    null,
    dispatch => ({
        markRead: e => {
            const action = {
                type: 'yotification_markRead',
                id: e
            }
            console.log('markRead', action)
            dispatch(action)
        }
    }))(NotificationPostReply)
