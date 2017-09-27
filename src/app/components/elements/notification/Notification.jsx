import React from 'react';
import { Link } from 'react-router'
import {connect} from 'react-redux'
import tt from 'counterpart'
import Userpic from 'app/components/elements/Userpic'
import TimeAgoWrapper from 'app/components/elements/TimeAgoWrapper'
import Url from 'app/utils/Url';
import * as type from './type'

class NotificationLink extends React.Component {
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
        const amount = this.props.amount
        const author = this.props.author
        const post = this.props.rootItem
        const item = this.props.item
        const created = this.props.created
        const classNames = (this.props.read)? '' : 'unread'
        const notificationType = this.props.notificationType

        let bodyContent = null
        let headerContent = null
        let link = Url.comment(post, item)

        switch (notificationType) {
            case type.POST_REPLY :
                headerContent = <span><span className="user">{ author }</span> { tt("notifications.postReply.action") } </span>
                bodyContent = item.parentSummary
                break
            case type.COMMENT_REPLY :
                headerContent = <span><span className="user">{ author }</span> { tt("notifications.commentReply.action") } </span>
                bodyContent = post.summary
                break
            case type.RECEIVE_STEEM :
                headerContent = <span><span className="subject">{ amount } { tt("g.steem") }</span> { tt("notifications.receiveSteem.action") } <span className="user">{ author }</span></span>
                break
            case type.RESTEEM :
                headerContent = <span><span className="user">{ author }</span> { tt("notifications.resteem.action") }</span>
                bodyContent = item.summary
                link = Url.comment(item)
                break
            case type.TAG :
                headerContent = <span><span className="user">{ author }</span> { (0 === item.depth)? tt("notifications.tag.actionPost") : tt("notifications.tag.actionComment") }</span>
                bodyContent = item.summary
                break
            case type.VOTE :
                let actionText = tt("notifications.vote.actionComment")
                if(0 === item.depth) {
                    actionText = tt("notifications.vote.actionPost")
                    link = Url.comment(item)
                }
                headerContent = <span><span className="user">{ author }</span> { actionText }</span>
                bodyContent = item.summary
                break
            default :
                console.log("no option for this notification", this.props)
                return null
        }


        return <Link href={ link } className={ classNames } onClick={ this.markRead } >
            <div className="item-panel" >
                <div className="Comment__Userpic show-for-medium">
                    <Userpic account={ author } />
                </div>
                <div className="item-header">
                    { headerContent }
                </div>
                {bodyContent ?
                    <div className="item-body">{bodyContent}</div> : null
                }
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
    }))(NotificationLink)
