/**
 * @locale {skip-validation}
 */
import React from 'react';
import { Link } from 'react-router'
import {connect} from 'react-redux'
import tt from 'counterpart'
import Userpic from 'app/components/elements/Userpic'
import TimeAgoWrapper from 'app/components/elements/TimeAgoWrapper'
import Url from 'app/utils/Url'
import * as type from './type'
import badges from './icon'

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
        const classNames = (this.props.read)? '' : 'unread'
        const created = this.props.created
        const item = this.props.item
        const post = this.props.rootItem
        const notificationType = this.props.notificationType

        const badge = badges[notificationType]? badges[notificationType] : null
        const localeRoot = `notifications.${notificationType}`

        let bodyContent = null
        let headerContent = null
        let link = Url.comment(post, item)
        let localeAction = `${localeRoot}.action`
        let picture = null
        console.log('localeAction', localeAction)
        switch (notificationType) {
            case type.FOLLOW_POST_POST :
                throw new Error(`Notification ${notificationType} not implemented`)
            case type.POST_REPLY :
                headerContent = <span><span className="user">{ author }</span> { tt(localeAction) } <strong>{ post.summary }</strong></span>
                bodyContent = item.summary
                break
            case type.COMMENT_REPLY :
                headerContent = <span><span className="user">{ author }</span> { tt(localeAction) } <strong>{ item.parentSummary }</strong></span>
                bodyContent = item.summary
                break
            case type.ANNOUNCEMENT :
            case type.ANNOUNCEMENT_IMPORTANT :
                //todo: use announcement comment 'image' as icon post steemfest. This will require addl info from yo.
            case type.FOLLOW_AUTHOR_POST :
                headerContent = <span><span className="user">{ author }</span> { tt(localeAction) } </span>
                bodyContent = item.summary
                break
            case type.POWER_DOWN :
                console.log(`Notification type - ${notificationType} needs to use the steemit logo check with all to see if this can just be part of the account, or if it needs special treatment`)
                headerContent = <span><span className="subject">{ tt(`${localeRoot}.subject`) }</span> { tt(localeAction) }</span>
                break
            case type.RECEIVE_STEEM :
                headerContent = <span><span className="subject">{ amount } { tt("g.steem") }</span> { tt(localeAction) } <span className="user">{ author }</span></span>
                break
            case type.RESTEEM :
                headerContent = <span><span className="user">{ author }</span> { tt(localeAction) }</span>
                bodyContent = item.summary
                link = Url.comment(item)
                break
            case type.SECURITY_PWD_CHANGE :
            case type.SECURITY_WITHDRAWAL :
            case type.SECURITY_NEW_MOBILE :
            case type.SECURITY_POWER_DOWN :
                headerContent = <span><span className="subject">{ tt(`${localeRoot}.subject`) }</span> { tt(localeAction) }</span>
                bodyContent = tt(`${localeRoot}.body`)
                break
            case type.TAG :
            case type.VOTE :
                localeAction = localeRoot + '.actionComment'
                if(0 === item.depth) {
                    localeAction = localeRoot + '.actionPost'
                    link = Url.comment(item)
                }
                headerContent = <span><span className="user">{ author }</span> { tt(localeAction) }</span>
                bodyContent = item.summary
                break
            default :
                console.log(`no option for this notification ${notificationType}`, this.props)
                return null
        }

        switch (notificationType) {
            //case type.ANNOUNCEMENT_IMPORTANT :
                //todo: special image - unknown json format in notification
            case type.POWER_DOWN :
                //todo: blank circle image
                break
            default :
                picture = <Userpic account={ author } badge={ badge } />
        }


        return <Link href={ link } className={ classNames } onClick={ this.markRead } >
            <div className="item-panel" >
                { (notificationType !== type.POWER_DOWN) ? <div className={ "Comment__Userpic show-for-medium " + notificationType} >
                        { picture }
                </div> : null }
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
            dispatch(action)
        }
    }))(NotificationLink)
