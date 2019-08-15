import React, { Component } from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import tt from 'counterpart';
import PropTypes from 'prop-types';
import NativeSelect from 'app/components/elements/NativeSelect';

class Topics extends Component {
    static propTypes = {
        categories: PropTypes.object.isRequired,
        order: PropTypes.string.isRequired,
        current: PropTypes.string,
        compact: PropTypes.bool.isRequired,
    };

    static defaultProps = {
        current: '',
    };

    render() {
        const {
            order,
            current,
            compact,
            className,
            username,
            categories,
        } = this.props;

        if (compact) {
            const currentlySelected = (
                currentTag,
                username,
                currentOrder = false
            ) => {
                const opts = {
                    feed: `/@${username}/feed`,
                    tagOnly: `/trending/${currentTag}`,
                    orderOnly: `/${currentOrder}`,
                    tagWithOrder: `/${currentOrder}/${currentTag}`,
                    default: `/trending`,
                };
                if (currentTag === 'feed') return opts['feed'];
                if (currentTag && currentOrder) return opts['tagWithOrder'];
                if (!currentTag && currentOrder) return opts['orderOnly'];
                if (currentTag && !currentOrder) return opts['tagOnly'];
                return opts['default'];
            };

            const onChange = selected => {
                browserHistory.push(selected.value);
            };

            const extras = username => {
                const ex = {
                    allTags: order => ({
                        value: `/${order}`,
                        label: `${tt('g.all_tags_mobile')}`,
                    }),
                    myFeed: name => ({
                        value: `/@${name}/feed`,
                        label: `${tt('g.my_feed')}`,
                    }),
                };
                return username
                    ? [ex.allTags(order), ex.myFeed(username)]
                    : [ex.allTags(order)];
            };

            const opts = extras(username).concat(
                categories
                    .map(cat => {
                        const link = order ? `/${order}/${cat}` : `/${cat}`;
                        return { value: link, label: cat };
                    })
                    .toJS()
            );

            return (
                <NativeSelect
                    currentlySelected={currentlySelected(
                        current,
                        username,
                        order
                    )}
                    options={opts}
                    onChange={onChange}
                />
            );
        } else {
            const categoriesLinks = categories.map(cat => {
                const comm = this.props.communities.get(cat);
                return (
                    <li className="c-sidebar__list-item" key={cat}>
                        <Link
                            to={`/trending/${cat}`}
                            className="c-sidebar__link"
                            activeClassName="active"
                            style={{ fontStyle: comm ? 'normal' : 'italic' }}
                        >
                            {comm ? comm.get('title', cat) : '#' + cat}
                        </Link>
                    </li>
                );
            });
            return (
                <div className="c-sidebar__module">
                    <div className="c-sidebar__content">
                        <ul className="c-sidebar__list">
                            <li className="c-sidebar__list-item">
                                <div className="c-sidebar__header">
                                    <Link
                                        to={'/trending'}
                                        className="c-sidebar__link"
                                        activeClassName="active"
                                    >
                                        {tt('g.all_tags')}
                                    </Link>
                                </div>
                            </li>
                            {username && (
                                <li className="c-sidebar__list-item">
                                    <div className="c-sidebar__header">
                                        <Link
                                            to={`/@${username}/feed`}
                                            className="c-sidebar__link"
                                            activeClassName="active"
                                        >
                                            {tt('g.my_feed')}
                                        </Link>
                                    </div>
                                </li>
                            )}
                            {username && (
                                <li className="c-sidebar__list-item">
                                    <div className="c-sidebar__header">
                                        <Link
                                            to={`/@${username}/feed`}
                                            className="c-sidebar__link"
                                            activeClassName="active"
                                        >
                                            My subscriptions
                                        </Link>
                                    </div>
                                </li>
                            )}
                            <li className="c-sidebar__list-item">
                                <div
                                    style={{ color: '#aaa', paddingTop: '1em' }}
                                >
                                    Communities
                                </div>
                            </li>
                            {categoriesLinks}
                            <li className="c-sidebar__link">
                                <Link
                                    className="c-sidebar__link c-sidebar__link--emphasis"
                                    to={`/tags`}
                                >
                                    {tt('g.show_more_topics')}&hellip;
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
            );
        }
    }
}

export default connect(
    // mapStateToProps
    (state, ownProps) => ({
        ...ownProps,
        communities: state.global.get('community'),
    })
)(Topics);
