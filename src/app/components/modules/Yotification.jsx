import {connect} from 'react-redux';
import tt from 'counterpart'
import Icon from 'app/components/elements/Icon';
import Notification from 'app/components/elements/notification';
import * as nType from 'app/components/elements/notification/type';
import { Link } from 'react-router'
import React from 'react';
import Url from 'app/utils/Url';

export const LAYOUT_PAGE = 'Page';
export const LAYOUT_DROPDOWN = 'Dropdown';

export const FILTER_ALL = 'all';

const filters = {
    security: [nType.SECURITY_PWD_CHANGE, nType.SECURITY_WITHDRAWAL, nType.SECURITY_NEW_MOBILE, nType.SECURITY_POWER_DOWN],
    transfers: [nType.RECEIVE_STEEM, nType.POWER_DOWN],
    comments: [nType.POST_REPLY],
    replies: [nType.COMMENT_REPLY],
    resteems: [nType.RESTEEM],
    following: [nType.FOLLOW_AUTHOR_POST]
}

const makeNotificationList = (notifications = []) => {
    const notificationList = [];
    notifications.forEach( notification => {
        if(!notification.hide) {
            const classNames = "item" + ( notification.read ? '' : ' unread' );
            notificationList.push( <li className={ classNames } key={notification.id}><Notification { ...notification } /></li> );
        }
    })
    return ( <ul className="Notifications">{ notificationList }</ul> );
}

const makeFilterList = () => {
    const filterLIs = Object.keys(filters).reduce((list, filter) => {
        console.log(Url.notifications(filter))
        list.push(<li key={filter}><Link
            href={Url.notifications(filter)}>{tt(`notifications.filters.${filter}`)}</Link></li>);
        return list;
    }, [<li key="all"><Link href={Url.notifications()}>{tt('notifications.filters.all')}</Link></li>]);
    return ( <ul className="menu">{filterLIs}</ul>);
}

class YotificationModule extends React.Component {
    constructor(props) {
        super(props);
        switch (props.layout) { //eslint-disable-line
            case LAYOUT_DROPDOWN :
                this.state = {
                    layout: props.layout,
                    showFilters: false,
                    showFooter: true
                };
                break;
            case LAYOUT_PAGE :
                this.state = {
                    layout: props.layout,
                    showFilters: true,
                    showFooter: false
                };
                break;
        }

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

    render() {
        return ( <div className={"NotificationsModule " + this.state.layout} >
            <div className="title">{tt('g.notifications')}
                <span className="controls-right">
                    <button className="ptc" onClick={ this.markAllRead }>Mark All as Read</button>
                    <button className="ptc" onClick={ this.loadTestData }>Populate</button> {/* Todo: for dev only! Do not merge if present!*/}
                    <button className="ptc" onClick={ this.loadMoreTestData }>... more</button> {/* Todo: for dev only! Do not merge if present!*/}
                    <Link href={Url.profileSettings()}><Icon name="cog" /></Link>
                </span>
            </div>
            { (this.state.showFilters)? makeFilterList() : null}
            { makeNotificationList(this.props.notifications) }
            { (this.state.showFooter)? (<div className="footer">
                <Link href={ Url.profile() + '/notifications'} className="view-all">View All</Link>
            </div>) : null }
            </div> );
    }
}

YotificationModule.propTypes = {
    comeOnItsSuchAJoy: React.PropTypes.func.isRequired, // Todo: for dev only! Do not merge if present!
    getSomeGetSomeGetSomeYeahYeah: React.PropTypes.func.isRequired, // Todo: for dev only! Do not merge if present!
    markAllRead: React.PropTypes.func.isRequired,
    notifications: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
    layout: React.PropTypes.oneOf([LAYOUT_PAGE, LAYOUT_DROPDOWN])
};

YotificationModule.defaultProps = {
    layout: LAYOUT_PAGE
};

export default connect(
    // mapStateToProps
    (state, ownProps) => {
        let notifications = state.notification.byId.toArray();
        const filter = (ownProps.filter && filters[ownProps.filter])? ownProps.filter : FILTER_ALL;
        //todo: here is where we're going to want to choose which filtered list is handed to the render function
        // (rather than performing the reduction inside this class)
        if(notifications && filter !== FILTER_ALL) {
            const filteredTypes = filters[filter]
            notifications = notifications.reduce((notifs, n) => {
                if(filteredTypes.indexOf(n.notificationType) > -1) {
                    notifs.push(n);
                }
                return notifs;
            }, [])
        }

        return {
            ...ownProps,
            notifications,
            filter
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
)(YotificationModule)

