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
            username,
            categories,
            communities,
        } = this.props;

        if (compact) {
            const label = tag => communities.getIn([tag, 'title'], '#' + tag);
            const opt = tag => {
                if (tag === 'feed')
                    return {
                        value: `/@${username}/feed`,
                        label: tt('g.my_feed'),
                    };
                if (tag === 'my')
                    return { value: `/trending/my`, label: 'My subscriptions' };
                if (tag)
                    return { value: `/trending/${tag}`, label: label(tag) };
                return { value: `/trending`, label: tt('g.all_tags') };
            };

            let options = [];
            options.push(opt(null));

            if (username) {
                options.push(opt('feed'));
                options.push(opt('my'));
            }

            options = options.concat(categories.map(cat => opt(cat)).toJS());
            options = options.filter(opt => opt.label); // #TODO: filter on backend

            const currOpt = opt(current);
            if (!options.find(opt => opt.value == currOpt.value)) {
                options.push(opt(current));
            }

            return (
                <NativeSelect
                    options={options}
                    currentlySelected={currOpt.value}
                    onChange={opt => {
                        browserHistory.push(opt.value);
                    }}
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
                                            {'My friends' || tt('g.my_feed')}
                                        </Link>
                                    </div>
                                </li>
                            )}
                            {username && (
                                <li className="c-sidebar__list-item">
                                    <div className="c-sidebar__header">
                                        <Link
                                            to={`/trending/my`}
                                            className="c-sidebar__link"
                                            activeClassName="active"
                                        >
                                            My communities
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
