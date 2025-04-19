import React, { Component } from 'react';
import { Link, browserHistory } from 'react-router';
import { connect } from 'react-redux';
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
                        label: tt('g.my_feed') || 'My Friends',
                    };
                if (tag === 'my')
                    return {
                        value: `/trending/my`,
                        label: tt('g.my_communities') || 'My communities',
                    };
                if (tag == 'explore')
                    return {
                        value: `/communities`,
                        label:
                            tt('g.explore_communities') ||
                            'Explore Communities',
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
            options.push(opt('explore'));
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
                    label: tt('g.community_subscriptions'),
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
                    label: tt('g.trending_communities'),
                    disabled: true,
                });
                options.push(...topicsOptions);
            }

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

        const link = (url, label, className = '') => (
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

        const list = (
            <span>
                {(subscriptions || topics).size > 0}
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
            </span>
        );

        return (
            <ul id="Subscriptions" className="MySubscriptions">
                {list}
            </ul>
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
