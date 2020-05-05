import React, { Component } from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import tt from 'counterpart';
import PropTypes from 'prop-types';
import NativeSelect from 'app/components/elements/NativeSelect';

class Topics extends Component {
    static propTypes = {
        topics: PropTypes.object.isRequired,
        subscriptions: PropTypes.object,
        current: PropTypes.string,
        compact: PropTypes.bool.isRequired,
    };

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

        if (compact) {
            const opt = (tag, label = null) => {
                if (tag && tag[0] === '@')
                    return {
                        value: `/@${username}/feed`,
                        label: 'My friends' || `tt('g.my_feed')`,
                    };
                if (tag === 'my')
                    return { value: `/trending/my`, label: 'My communities' };
                if (tag == 'explore')
                    return {
                        value: `/communities`,
                        label: 'Explore Communities...',
                    };
                if (tag)
                    return {
                        value: `/trending/${tag}`,
                        label: label || '#' + tag,
                    };
                return { value: `/`, label: tt('g.all_tags') };
            };

            const options = [];
            // Add 'All Posts' link.
            options.push(opt(null));
            if (username && subscriptions) {
                // Add 'My Friends' Link
                options.push(opt('@' + username));
                // Add 'My Communities' Link
                options.push(opt('my'));
                const subscriptionOptions = subscriptions
                    .toJS()
                    .map(cat => opt(cat[0], cat[1]));
                options.push({
                    value: 'Subscriptions',
                    label: 'Community Subscriptions',
                    disabled: true,
                });
                options.push(...subscriptionOptions);
            }
            if (topics) {
                const topicsOptions = topics
                    .toJS()
                    .map(cat => opt(cat[0], cat[1]));
                options.push({
                    value: 'Topics',
                    label: 'Trending Communities',
                    disabled: true,
                });
                options.push(...topicsOptions);
            }

            options.push(opt('explore'));
            const currOpt = opt(current);
            if (!options.find(opt => opt.value == currOpt.value)) {
                options.push(
                    opt(current, communities.getIn([current, 'title']))
                );
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
        }

        const link = (url, label, className = 'c-sidebar__header') => (
            <div className={className}>
                <Link
                    to={url}
                    className="c-sidebar__link"
                    activeClassName="active"
                >
                    {label}
                </Link>
            </div>
        );

        const moreLabel = <span>{tt('g.show_more_topics')}&hellip;</span>;
        const title =
            subscriptions && username
                ? 'My subscriptions'
                : 'Trending Communities';
        const commsHead = (
            <div style={{ color: '#aaa', paddingTop: '0em' }}>{title}</div>
        );
        const list = (
            <ul className="c-sidebar__list">
                <li>{link('/', tt('g.all_tags'))}</li>
                {username && (
                    <li>{link(`/@${username}/feed`, 'My friends')}</li>
                )}
                {username && <li>{link(`/trending/my`, 'My communities')}</li>}
                {(subscriptions || topics).size > 0 && <li>{commsHead}</li>}
                {username &&
                    subscriptions &&
                    subscriptions
                        .toJS()
                        .map(cat => (
                            <li key={cat[0]}>
                                {link(`/trending/${cat[0]}`, cat[1], '')}
                            </li>
                        ))}
                {(!username || !subscriptions) &&
                    topics
                        .toJS()
                        .map(cat => (
                            <li key={cat[0]}>
                                {link(`/trending/${cat[0]}`, cat[1], '')}
                            </li>
                        ))}
                <li>
                    {link(
                        `/communities`,
                        moreLabel,
                        'c-sidebar__link--emphasis'
                    )}
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
)(Topics);
