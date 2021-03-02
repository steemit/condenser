import React, { Component } from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import tt from 'counterpart';
import PropTypes from 'prop-types';
import NativeSelect from 'app/components/elements/NativeSelect';

class Announcement extends Component {
    static propTypes = {};

    static defaultProps = {
        current: '',
    };

    render() {
        const {
            current,
            compact,
            username,
            topics,
            subscriptions,
            communities,
        } = this.props;

        const commsHead = (
            <div style={{ color: '#aaa', paddingTop: '0em' }}>{}</div>
        );
        const list = (
            <ul className="c-sidebar__list_ann">
                <li>
                    <div className="c-sidebar__header">公告</div>
                </li>
                <li>
                    <a href="https://www.baidu.com/" target="_blank">
                        www.baidu.com
                    </a>
                </li>
                <li>
                    <a href="https://www.google.com/" target="_blank">
                        www.google.com
                    </a>
                </li>
                <li>
                    <a href="https://www.youtube.com/" target="_blank">
                        www.youtube.com
                    </a>
                </li>
            </ul>
        );
        return (
            <div className="c-sidebar__module">
                <div className="c-sidebar__content">{list}</div>
            </div>
        );
    }
}

export default connect(
    // mapStateToProps
    (state, ownProps) => ({
        ...ownProps,
        communities: state.global.get('community'),
    })
)(Announcement);
