import React from 'react'
import {connect} from 'react-redux'
import { Link } from 'react-router'
import Icon from 'app/components/elements/Icon'
import tt from 'counterpart'

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
    }


    markAllRead = (e) => {
        e.preventDefault()
        this.props.markAllRead()
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
        var yotifications = state.app.getIn(['yotifications']);
        const notifications = (yotifications && yotifications.size > 0)? yotifications.toJS() : []
        return {
            notifications,
            ...ownProps
        }
    },
    dispatch => ({
        markAllRead: () => {
            const action = {
                type: 'yotification_markAllRead',
            }
            dispatch(action)
        }
    })
)(NotificationMenu)
