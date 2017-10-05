import React from 'react'
import {connect} from 'react-redux'
import { Link } from 'react-router'
import Icon from 'app/components/elements/Icon'
import tt from 'counterpart'

import notificationReducer from 'app/redux/NotificationReducer';
import { makeNotificationList } from 'app/components/elements/notification';

class NotificationMenu extends React.Component {
    static propTypes = {
        account_link: React.PropTypes.string.isRequired,
        items: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
        title: React.PropTypes.string,
        className: React.PropTypes.string,
        hideValue: React.PropTypes.oneOfType([
            React.PropTypes.string,
            React.PropTypes.element
        ]),
        markAllRead: React.PropTypes.func,
        notifications: React.PropTypes.array,
        getSomeGetSomeGetSomeYeahYeah: React.PropTypes.func, // Todo: for dev only! Do not merge if present!
        comeOnItsSuchAJoy: React.PropTypes.func, // Todo: for dev only! Do not merge if present!
    }

    markAllRead = (e) => {
        e.preventDefault()
        this.props.markAllRead()
    }

    loadTestData = () => { // Todo: for dev only! Do not merge if present!
        this.props.getSomeGetSomeGetSomeYeahYeah();
    }

    loadMoreTestData = () => { // Todo: for dev only! Do not merge if present!
        this.props.comeOnItsSuchAJoy();
    }

    closeMenu = (e) => {
        // If this was not a left click, or if CTRL or CMD were held, do not close the menu.
        if(e.button !== 0 || e.ctrlKey || e.metaKey) return;
        // Simulate clicking of document body which will close any open menus
        document.body.click();
    }

    render() {
        const {account_link, className} = this.props

        return ( <ul className={'NotificationMenu menu vertical' + (className ? ' ' + className : '')}>
            <li className="title">{tt('g.notifications')}
                <span className="controls-right">
                    <button className="ptc" onClick={ this.markAllRead }>Mark All as Read</button>
                    <button className="ptc" onClick={ this.loadTestData }>Populate</button> {/* Todo: for dev only! Do not merge if present!*/}
                    <button className="ptc" onClick={ this.loadMoreTestData }>... more</button> {/* Todo: for dev only! Do not merge if present!*/}
                    <Link href={account_link}><Icon name="cog" /></Link>
                </span>
            </li>
            { makeNotificationList(this.props.notifications) }
            <li className="footer">
                <Link href={ account_link + '/notifications'} className="view-all">View All</Link>
            </li>
        </ul> )
    }
}

export default connect(
    // mapStateToProps
    (state, ownProps) => {
        return {
            notifications: state.notification.byId.toArray(),
            ...ownProps
        }
    },
    dispatch => ({
        getSomeGetSomeGetSomeYeahYeah: () => {  // Todo: for dev only! Do not merge if present!
            dispatch({
                type: 'notification/RECEIVE_ALL',
                payload: [
                    {"id":"UID","read":true,"shown":true,"notificationType":"powerDown","created":"2010-09-19T16:19:48","author":"roadscape","amount":10000.2},
                    {"id":"UID1","read":false,"shown":false,"notificationType":"resteem","created":"2010-08-19T18:59:00","author":"roadscape","item":{"author":"wolfcat","category":"introduceyourself","depth":0,"permlink":"from-the-hills-of-ireland-to-planet-steem-a-wolfy-hello","summary":"From the Hills of Ireland to Planet Steem, A Wolfy Hello!"}},
                    {"id":"UID2","read":false,"shown":true,"notificationType":"vote","notificationTime":3,"author":"beanz","created":"2017-09-19T18:59:00","item":{"author":"wolfcat","category":"introduceyourself","depth":0,"permlink":"from-the-hills-of-ireland-to-planet-steem-a-wolfy-hello","summary":"From the Hills of Ireland to Planet Steem, A Wolfy Hello!"}},
                    {"id":"UID3","read":true,"shown":true,"notificationType":"receiveSteem","created":"2017-09-19T16:19:48","author":"roadscape","amount":10000.2},
                    {"id":"UID4","read":true,"shown":true,"notificationType":"tag","created":"2020-09-19T07:48:03","author":"lovejoy","item":{"author":"lovejoy","category":"introduceyourself","depth":2,"permlink":"re-steemcleaners-re-steemcleaners-re-wolfcat-from-the-hills-of-ireland-to-planet-steem-a-wolfy-hello-20170919t120245144z","summary":"@wolfcat is a new user who normally doesn't spend a lot of time online, plus we are "},"rootItem":{"author":"wolfcat","category":"introduceyourself","permlink":"from-the-hills-of-ireland-to-planet-steem-a-wolfy-hello","summary":"From the Hills of Ireland to Planet Steem, A Wolfy Hello!"}},
                    {"id":"UID5","read":false,"shown":false,"notificationType":"vote","created":"2020-11-19T11:59:39","author":"roadscape","item":{"author":"wolfcat","category":"introduceyourself","depth":0,"permlink":"from-the-hills-of-ireland-to-planet-steem-a-wolfy-hello","summary":"From the Hills of Ireland to Planet Steem, A Wolfy Hello!"}},
                    {"id":"UID6","read":true,"shown":true,"notificationType":"postReply","created":"2017-09-19T14:24:51","author":"lovejoy","item":{"author":"lovejoy","category":"introduceyourself","depth":2,"permlink":"re-steemcleaners-re-steemcleaners-re-wolfcat-from-the-hills-of-ireland-to-planet-steem-a-wolfy-hello-20170919t120245144z","summary":"@wolfcat is a new user who normally doesn't spend a lot of time online, plus we are ","parentSummary":"You may want to retract your votes.The account has ignored our many requests to confirm the identity. It seems to be another case of fake identity. Thanks."},"rootItem":{"author":"wolfcat","category":"introduceyourself","permlink":"from-the-hills-of-ireland-to-planet-steem-a-wolfy-hello","summary":"From the Hills of Ireland to Planet Steem, A Wolfy Hello!"}},
                    {"id":"UID6.1","read":true,"shown":true,"notificationType":"securityNewMobileDevice","created":"2017-09-19T14:24:51","author":"security"},
                    {"id":"UID7","read":false,"shown":true,"notificationType":"commentReply","created":"2017-09-18T17:21:18","author":"dbzfan4awhile","item":{"author":"dbzfan4awhile","category":"introduceyourself","depth":3,"permlink":"re-wolfcat-re-dbzfan4awhile-re-wolfcat-from-the-hills-of-ireland-to-planet-steem-a-wolfy-hello-20170918t172118886z","summary":"Awesome!","parentSummary":"Yes! Ill look for you there :)"},"rootItem":{"author":"wolfcat","category":"introduceyourself","permlink":"from-the-hills-of-ireland-to-planet-steem-a-wolfy-hello","summary":"From the Hills of Ireland to Planet Steem, A Wolfy Hello!"}}
                ],
            });
        },
        comeOnItsSuchAJoy: () => {  // Todo: for dev only! Do not merge if present!
            dispatch({
                type: 'notification/APPEND_SOME',
                payload: [
                    {"id":"UID6.1","read":false,"shown":false,"notificationType":"securityNewMobileDevice","created":"2017-09-19T14:24:51","author":"security"},
                    {"id":"UID8","read":false,"shown":false,"notificationType":"powerDown","created":"2021-09-19T16:19:48","author":"roadscape","amount":138},
                    {"id":"UID9","read":true,"shown":true,"notificationType":"powerDown","created":"2021-09-20T16:19:48","author":"roadscape","amount":138},
                    {"id":"UID10","read":false,"shown":true,"notificationType":"powerDown","created":"2021-09-21T16:19:48","author":"roadscape","amount":138},
                ],
            });
        },
        markAllRead: () => {
            const action = {
                type: 'notification/MARK_ALL_READ',
            }
            dispatch(action)
        }
    })
)(NotificationMenu)
