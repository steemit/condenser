import React, { Component } from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import tt from 'counterpart';
import markdown from 'markdown';
import { actions as fetchDataSagaActions } from 'app/redux/FetchDataSaga';

const mk = markdown.markdown;

class Announcement extends Component {
    static propTypes = {};

    static defaultProps = {
        current: '',
    };

    componentDidMount() {
        const { getNotices } = this.props;
        getNotices();
    }

    render() {
        const { notices, user_preferences } = this.props;

        const commsHead = (
            <div style={{ color: '#aaa', paddingTop: '0em' }}>{}</div>
        );
        const list = (
            <ul className="c-sidebar__list_ann">
                <li>
                    <div className="c-sidebar__header">
                        {tt('g.announcement')}
                    </div>
                </li>
                {notices &&
                    notices.map((item, index) => {
                        const notice = item.toJS();
                        const locale = user_preferences.locale;
                        if (notice.status !== 1) return null;
                        return (
                            <li
                                key={index}
                                dangerouslySetInnerHTML={{
                                    __html: mk.toHTML(
                                        notice.body[
                                            locale === 'zh' ? 'cn' : 'en'
                                        ]
                                    ),
                                }}
                            />
                        );
                    })}
            </ul>
        );

        return notices && notices.size > 0 && notices.toJS()[0].status === 1 ? (
            <div className="c-sidebar__module">
                <div className="c-sidebar__content">{list}</div>
            </div>
        ) : (
            <div />
        );
    }
}

export default connect(
    // mapStateToProps
    (state, ownProps) => ({
        ...ownProps,
        notices: state.global.get('notices'),
        user_preferences: state.app.get('user_preferences').toJS(),
    }),
    dispatch => ({
        getNotices: username => {
            return dispatch(fetchDataSagaActions.getNotices(username));
        },
    })
)(Announcement);
