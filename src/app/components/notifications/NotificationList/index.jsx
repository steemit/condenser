import { connect } from 'react-redux';
import tt from 'counterpart';
import classNames from 'classnames';
import Icon from 'app/components/elements/Icon';
import LoadingIndicator from 'app/components/elements/LoadingIndicator';
import Notification from 'app/components/notifications/Notification';
import { filters } from 'app/components/notifications/Notification/type';
import { Link } from 'react-router';
import debounce from 'lodash.debounce';
import Immutable from 'immutable';
import React from 'react';
import Url from 'app/utils/Url';
import * as notificationActions from 'app/redux/NotificationReducer';
import { selectors as userSelectors } from 'app/redux/UserReducer';

export const FILTER_ALL = 'all';

const renderFilterList = (username, filter) => {
    let className = filter === FILTER_ALL ? 'selected' : '';
    const filterLIs = Object.keys(filters).reduce(
        (list, filter) => {
            className = filter === filter ? 'selected' : '';
            const dest = Url.notifications(username, filter);
            const text = tt(`notifications.filters.${filter}`);
            list.push(
                <li key={filter} className={className}>
                    <Link to={dest}>{text}</Link>
                </li>
            );
            return list;
        },
        [
            <li key="legend" className="selected">
                {tt('notifications.filters._label')}
            </li>,
            <li key="all" className={className}>
                <Link to={Url.notifications()}>
                    {tt('notifications.filters.all')}
                </Link>
            </li>,
        ]
    );
    return <ul className="menu">{filterLIs}</ul>;
};

class NotificationList extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        window.addEventListener('scroll', this.scrollListenerPage, {
            capture: false,
            passive: true,
        });
        window.addEventListener('resize', this.scrollListenerPage, {
            capture: false,
            passive: true,
        });
    }

    markDisplayedRead = () => {
        this.props.updateSome(this.props.filterIds.toArray(), { read: true });
    };

    markDisplayedHidden = () => {
        this.props.updateSome(this.props.filterIds.toArray(), { hide: true });
    };

    appendSome = () => {
        this.props.appendSome(
            this.props.filter !== FILTER_ALL
                ? filters[this.props.filter]
                : false
        );
    };

    //todo: make sure this doesn't fire too often in either layout
    scrollListenerPage = debounce(() => {
        //eslint-disable-line no-undef
        if (this.props.noMoreToFetch) return;

        const el = window.document.getElementById(this.htmlId);
        if (!el) return;
        const scrollTop =
            window.pageYOffset !== undefined
                ? window.pageYOffset
                : (
                      document.documentElement ||
                      document.body.parentNode ||
                      document.body
                  ).scrollTop;
        //the eslint thing for the next line...  apparently math is scary!?
        if (
            topPosition(el) + el.offsetHeight - scrollTop - window.innerHeight <
            10
        ) {
            //eslint-disable-line no-mixed-operators
            this.props.appendSome(
                this.props.filter !== FILTER_ALL
                    ? filters[this.props.filter]
                    : false
            );
        }
    }, 150);

    render() {
        const {
            notifications,
            username,
            filter,
            filterIds,
            showClearAll,
        } = this.props;
        let notifArr = [];
        filterIds.map(id => {
            const notification = notifications.get(id);
            notifArr.push(
                <li
                    key={`steem_notification ${id} ${notification.created}`}
                    className={`item ${!notification.read && 'unread'}`}
                >
                    <Notification notification={notification} />
                </li>
            );
        });

        return (
            <div
                id={'NotificationsList Page'}
                className={classNames('NotificationsModule', 'Page', {
                    'no-notifications': notifications.size === 0,
                })}
                ref={el => {
                    this.rootEl = el;
                }}
            >
                <div className={classNames('title')}>
                    {tt('g.notifications')}
                    <span className="controls-right">
                        {showClearAll ? (
                            <button
                                className="ptc"
                                onClick={this.markDisplayedHidden}
                            >
                                {tt('notifications.controls.mark_all_hidden')}
                            </button>
                        ) : (
                            <button
                                className="ptc"
                                onClick={this.markDisplayedRead}
                            >
                                {tt('notifications.controls.mark_all_read')}
                            </button>
                        )}
                        <Link to={Url.profileSettings(username)}>
                            <Icon name="cog" />
                        </Link>
                    </span>
                </div>
                {renderFilterList(username, filter)}
                <ul className="Notifications">{notifArr}</ul>
                <div className="footer get-more">
                    {this.props.noMoreToFetch ? (
                        <div>No more to fetch!</div>
                    ) : this.props.isFetchingBefore ? (
                        <LoadingIndicator type="circle" inline />
                    ) : (
                        <button className="ptc" onClick={this.appendSome}>
                            {tt('notifications.controls.fetch_more')}
                        </button>
                    )}
                </div>
            </div>
        );
    }
}

NotificationList.propTypes = {
    updateSome: React.PropTypes.func.isRequired,
    appendSome: React.PropTypes.func.isRequired,
    notifications: React.PropTypes.instanceOf(Immutable.Map).isRequired,
    filterIds: React.PropTypes.oneOfType([
        React.PropTypes.instanceOf(Immutable.Set),
        React.PropTypes.instanceOf(Immutable.List), // initial state is fromJS'ed as a List
    ]).isRequired,
    showClearAll: React.PropTypes.bool.isRequired,
    noMoreToFetch: React.PropTypes.bool.isRequired,
    isFetchingBefore: React.PropTypes.bool.isRequired,
};

export default connect(
    // mapStateToProps
    (state, ownProps) => {
        const filter =
            ownProps.filter && filters[ownProps.filter]
                ? ownProps.filter
                : FILTER_ALL;

        let allRead =
            state.notification.byId.find(n => {
                return n.read === false;
            }) === undefined
                ? true
                : false;

        const filterToken =
            filter === FILTER_ALL ? FILTER_ALL : filters[filter].toString();
        const noMoreToFetch =
            state.notification.lastFetchBeforeCount.get(filterToken) === 0;

        return {
            ...ownProps,
            username: userSelectors.getUsername(state),
            notifications: state.notification.byId,
            filterIds:
                filter === FILTER_ALL
                    ? state.notification.allIds
                    : state.notification.byUserFacingType[filter],
            noMoreToFetch,
            isFetchingBefore: state.notification.isFetchingBefore,
            showClearAll: allRead,
        };
    },
    dispatch => ({
        updateSome: (ids, changes) =>
            dispatch(notificationActions.updateSome(ids, changes)),
        appendSome: types =>
            dispatch(notificationActions.fetchSome('before', types)),
    })
)(NotificationList);
