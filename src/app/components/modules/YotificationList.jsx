import { connect } from 'react-redux';
import tt from 'counterpart';
import classNames from 'classnames';
import Icon from 'app/components/elements/Icon';
import LoadingIndicator from 'app/components/elements/LoadingIndicator';
import Notification from 'app/components/elements/notification';
import { filters } from 'app/components/elements/notification/type';
import { Link } from 'react-router';
import debounce from 'lodash.debounce';
import Immutable from 'immutable';
import React from 'react';
import Url from 'app/utils/Url';
import * as notificationActions from 'app/redux/NotificationReducer';
import { selectors as userSelectors } from 'app/redux/UserReducer';

export const LAYOUT_PAGE = 'Page';
export const LAYOUT_DROPDOWN = 'Dropdown';
export const FILTER_ALL = 'all';

/**
 * Find the absolute offset relative to the window
 * @param domElt
 * @returns {*}
 */
function topPosition(domElt) {
    if (!domElt) {
        return 0;
    }
    return domElt.offsetTop + topPosition(domElt.offsetParent);
}

const renderNotificationList = (notifications, filterIds, onViewAll) => (
    <ul className="Notifications">
        {filterIds.map(id => {
            const notification = notifications.get(id);
            if (!notification.hide) {
                return (
                    <li
                        className={classNames('item', {
                            unread: !notification.read,
                        })}
                        key={notification.id}
                    >
                        <Notification data={notification} onClick={onViewAll} />
                    </li>
                );
            }
        })}
    </ul>
);

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

class YotificationList extends React.Component {
    constructor(props) {
        super(props);
        this.htmlId = 'YotifModule_' + Math.floor(Math.random() * 1000);
        switch (props.layout) { //eslint-disable-line
            case LAYOUT_DROPDOWN:
                this.state = {
                    layout: props.layout,
                    showFilters: false,
                    showFooter: true,
                };
                break;
            case LAYOUT_PAGE:
                this.state = {
                    layout: props.layout,
                    showFilters: true,
                    showFooter: false,
                };
                break;
        }
        //this.scrollListener = this.scrollListener.bind(this);
    }

    componentDidMount() {
        if (LAYOUT_PAGE === this.state.layout) {
            window.addEventListener('scroll', this.scrollListenerPage, {
                capture: false,
                passive: true,
            });
            window.addEventListener('resize', this.scrollListenerPage, {
                capture: false,
                passive: true,
            });
        } else if (LAYOUT_DROPDOWN === this.state.layout) {
            this.rootEl.parentElement.addEventListener(
                'scroll',
                this.scrollListenerDropdown,
                { capture: false, passive: true }
            );
        }
    }

    markDisplayedRead = () => {
        //eslint-disable-line no-undef
        this.props.updateSome(this.props.filterIds.toArray(), { read: true });
    };

    markDisplayedHidden = () => {
        //eslint-disable-line no-undef
        this.props.updateSome(this.props.filterIds.toArray(), { hide: true });
    };

    appendSome = () => {
        //eslint-disable-line no-undef
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

    scrollListenerDropdown = debounce(() => {
        //eslint-disable-line no-undef
        if (this.props.noMoreToFetch) return;

        const el = window.document.getElementById(this.htmlId);
        if (!el) return;

        if (
            el.scrollHeight <
            el.parentElement.offsetHeight + el.parentElement.scrollTop + 10
        ) {
            this.props.appendSome(
                this.props.filter !== FILTER_ALL
                    ? filters[this.props.filter]
                    : false
            );
        }
    }, 150);

    renderTitle(absolute = false) {
        return (
            <div className={classNames('title', { absolute })}>
                {tt('g.notifications')}
                <span className="controls-right">
                    {this.props.showClearAll ? (
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
                    <Link to={Url.profileSettings(this.props.username)}>
                        <Icon name="cog" />
                    </Link>
                </span>
            </div>
        );
    }

    render() {
        if (typeof this.props.username === 'undefined') return <div />;
        return (
            <div
                id={this.htmlId}
                className={classNames(
                    'NotificationsModule',
                    this.state.layout,
                    { 'no-notifications': this.props.notifications.size === 0 }
                )}
                ref={el => {
                    this.rootEl = el;
                }}
            >
                {this.renderTitle()}
                {this.state.showFilters
                    ? renderFilterList(this.props.username, this.props.filter)
                    : null}
                {renderNotificationList(
                    this.props.notifications,
                    this.props.filterIds,
                    this.props.onViewAll
                )}
                {this.renderTitle(true)}

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

                {this.state.showFooter ? (
                    <div className="footer">
                        {tt('notifications.controls.go_to_page')}
                    </div>
                ) : null}
                {this.state.showFooter ? (
                    <div className="footer absolute">
                        <Link
                            to={Url.profile() + '/notifications'}
                            onClick={this.props.onViewAll}
                            className="view-all"
                        >
                            {tt('notifications.controls.go_to_page')}
                        </Link>
                    </div>
                ) : null}
            </div>
        );
    }
}

YotificationList.propTypes = {
    updateSome: React.PropTypes.func.isRequired,
    appendSome: React.PropTypes.func.isRequired,
    notifications: React.PropTypes.instanceOf(Immutable.Map).isRequired,
    filterIds: React.PropTypes.oneOfType([
        React.PropTypes.instanceOf(Immutable.Set),
        React.PropTypes.instanceOf(Immutable.List), // initial state is fromJS'ed as a List
    ]).isRequired,
    layout: React.PropTypes.oneOf([LAYOUT_PAGE, LAYOUT_DROPDOWN]),
    showClearAll: React.PropTypes.bool.isRequired,
    noMoreToFetch: React.PropTypes.bool.isRequired,
    isFetchingBefore: React.PropTypes.bool.isRequired,
    onViewAll: React.PropTypes.func,
};

YotificationList.defaultProps = {
    layout: LAYOUT_PAGE,
    onViewAll: null,
};

export default connect(
    // mapStateToProps
    (state, ownProps) => {
        const filter =
            ownProps.filter && filters[ownProps.filter]
                ? ownProps.filter
                : FILTER_ALL;
        let allRead = true;

        state.notification.byId.forEach(n => {
            if (n.read === false) {
                allRead = false;
                return false;
            }
            return true;
        });

        const filterToken =
            filter === FILTER_ALL ? FILTER_ALL : filters[filter].toString();
        const noMoreToFetch =
            state.notification.lastFetchBeforeCount.get(filterToken) === 0;

        return {
            ...ownProps,
            username: userSelectors.getUsername(state.user),
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
)(YotificationList);
