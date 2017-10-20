import {connect} from 'react-redux';
import tt from 'counterpart'
import { Set } from 'immutable';
import Icon from 'app/components/elements/Icon';
import LoadingIndicator from 'app/components/elements/LoadingIndicator';
import Notification from 'app/components/elements/notification';
import { filters } from 'app/components/elements/notification/type';
import { Link } from 'react-router'
import debounce from 'lodash.debounce';
import React from 'react';
import Url from 'app/utils/Url';

export const LAYOUT_PAGE = 'Page';
export const LAYOUT_DROPDOWN = 'Dropdown';
export const FILTER_ALL = 'all';

const TIMEOUT_MARK_SHOWN_MILLIS = 3000;


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

const renderNotificationList = (notifications = []) => {
    const notificationList = [];
    notifications.forEach( notification => {
        if(!notification.hide) {
            const classNames = "item" + ( notification.read ? '' : ' unread' );
            notificationList.push( <li className={classNames} key={notification.id}><Notification {...notification} /></li> );
        }
    })
    return ( <ul className="Notifications">{notificationList}</ul> );
}

const renderFilterList = (props) => {
    const locales = tt;
    let className = ('all' === props.filter)? 'selected' : ''; //eslint-disable-line yoda
    const filterLIs = Object.keys(filters).reduce((list, filter) => {
        className = (filter === props.filter)? 'selected' : '';
        list.push(<li key={filter} className={className}><Link
            to={Url.notifications(filter)}>{locales(`notifications.filters.${filter}`)}</Link></li>);
        return list;
    }, [<li key="legend" className="selected">{tt("notifications.filters._label")}</li>, <li key="all" className={className}><Link to={Url.notifications()}>{tt('notifications.filters.all')}</Link></li>]);
    return ( <ul className="menu">{filterLIs}</ul>);
}

//todo: make functional


class YotificationList extends React.Component {
    constructor(props) {
        super(props);
        this.htmlId = 'YotifModule_' + Math.floor(Math.random() * 1000);
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
        //this.scrollListener = this.scrollListener.bind(this);
    }

    componentDidMount() {
        if(LAYOUT_PAGE === this.state.layout) {
            window.addEventListener('scroll', this.scrollListenerPage, {capture: false, passive: true});
            window.addEventListener('resize', this.scrollListenerPage, {capture: false, passive: true});
        } else if(LAYOUT_DROPDOWN === this.state.layout) {
            this.rootEl.parentElement.addEventListener('scroll', this.scrollListenerDropdown, {capture: false, passive: true});
        }
        this.markDisplayedShownWithDelay();
    }

    shouldComponentUpdate(nextProps, nextState) { //eslint-disable-line
        if(this.props.filter != nextProps.filter) {
            this.markDisplayedShownWithDelay();
        }
        return true;
    }

    componentWillUnmount() {
        clearTimeout(this.markDisplayedShownTimeout);
    }


    markDisplayedRead = () => { //eslint-disable-line no-undef
        this.props.updateSome(this.props.notifications, {read: true} );
    }

    markDisplayedHidden = () => { //eslint-disable-line no-undef
        this.props.updateSome(this.props.notifications, {hide: true} );
    }

    markDisplayedShownWithDelay = () => { //eslint-disable-line no-undef
        const self = this;
        clearTimeout(this.markDisplayedShownTimeout);
        this.markDisplayedShownTimeout = setTimeout(() => {
            self.props.updateSome(this.props.notifications, {shown: true} );
        }, TIMEOUT_MARK_SHOWN_MILLIS)
    }
    appendSome = () => { //eslint-disable-line no-undef
        this.props.appendSome(('all' !== this.props.filter)? filters[this.props.filter] : false); //eslint-disable-line yoda
    }

    //todo: make sure this doesn't fire too often in either layout
    scrollListenerPage = debounce(() => { //eslint-disable-line no-undef
        const el = window.document.getElementById(this.htmlId);
        if (!el) return;
        const scrollTop = (window.pageYOffset !== undefined) ? window.pageYOffset :
            (document.documentElement || document.body.parentNode || document.body).scrollTop;
        //the eslint thing for the next line...  apparently math is scary!?
        if (topPosition(el) + el.offsetHeight - scrollTop - window.innerHeight < 10) { //eslint-disable-line no-mixed-operators
            this.props.appendSome(('all' !== this.props.filter)? filters[this.props.filter] : false); //eslint-disable-line yoda
        }
    }, 150)

    scrollListenerDropdown = debounce(() => { //eslint-disable-line no-undef
        const el = window.document.getElementById(this.htmlId);
        if (!el) return;

        if(el.scrollHeight < (el.parentElement.offsetHeight + el.parentElement.scrollTop + 10)) {
            this.props.appendSome(('all' !== this.props.filter)? filters[this.props.filter] : false); //eslint-disable-line yoda
        }

    }, 150)

    render() {
        return ( <div id={this.htmlId} className={"NotificationsModule " + this.state.layout} ref={el => { this.rootEl = el }} >
            <div className="title">{tt('g.notifications')}
                <span className="controls-right">
                    {(this.props.showClearAll) ?
                        <button className="ptc" onClick={this.markDisplayedHidden}>{tt('notifications.controls.mark_all_hidden')}</button> :
                        <button className="ptc" onClick={this.markDisplayedRead}>{tt('notifications.controls.mark_all_read')}</button>
                    }
                    <Link to={Url.profileSettings()}><Icon name="cog" /></Link>
                </span>
            </div>
            {(this.state.showFilters)? renderFilterList(this.props) : null}
            {renderNotificationList(this.props.notifications)}
            <div className="footer get-more">
                {(true === this.props.fetchMore)? <LoadingIndicator type="circle" inline /> : <button className="ptc" onClick={this.appendSome}>{ this.props.fetchMore }</button>}</div>
            {(this.state.showFooter)? <div className="footer">{tt('notifications.controls.go_to_page')}</div> : null }
            {(this.state.showFooter)? (<div className="footer absolute">
                <Link to={Url.profile() + '/notifications'} className="view-all">{tt('notifications.controls.go_to_page')}</Link>
            </div>) : null}
        </div>);
    }
}

YotificationList.propTypes = {
    updateSome: React.PropTypes.func.isRequired,
    appendSome: React.PropTypes.func.isRequired,
    //notifications: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
    layout: React.PropTypes.oneOf([LAYOUT_PAGE, LAYOUT_DROPDOWN]),
    showClearAll: React.PropTypes.bool.isRequired
};

YotificationList.defaultProps = {
    layout: LAYOUT_PAGE
};

export default connect(
    // mapStateToProps
    (state, ownProps) => {
        const filter = (ownProps.filter && filters[ownProps.filter]) ? ownProps.filter : FILTER_ALL;
        let allRead = true;
        let notifications = state.notification.byId;
        const fetchMore = (state.notification.isFetchingBefore)? true : tt('notifications.controls.fetch_more')

        if (notifications && filter !== FILTER_ALL) {
            const filteredTypes = filters[filter];
            const filteredIds = filteredTypes.reduce((ids, tok) => state.notification.byType[tok] ? ids.union(state.notification.byType[tok]) : ids, Set());
            notifications = notifications.filter((v, id) => filteredIds.includes(id));
        }

        notifications.forEach((n) => {
            if (false === n.read) { //eslint-disable-line yoda
                allRead = false;
                return false;
            }
            return true;
        });


        return {
            notifications,
            ...ownProps,
            filter,
            fetchMore,
            showClearAll: allRead
        }
    },
    dispatch => ({
        updateSome: (notifications, changes) => {
            const ids = [];
            notifications.forEach((n) => {
                ids.push(n.id);
            });
            const action = {
                type: 'notification/UPDATE_SOME',
                ids,
                updates: changes
            };
            dispatch(action);
        },
        appendSome: (notificationTypes) => {
            const action = {
                type: 'notification/FETCH_SOME',
                types: notificationTypes,
                direction: 'before'
            };
            console.log('broadcasting notification/FETCH_SOME', action); //Todo: for dev only! Do not merge if present - probably belongs in a different place
            dispatch(action);
        }
    })
)(YotificationList)

