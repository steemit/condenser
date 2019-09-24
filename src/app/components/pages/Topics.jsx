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
            topics,
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
                    return { value: `/trending/my`, label: 'My subscriptions' };
                if (tag)
                    return {
                        value: `/trending/${tag}`,
                        label: label || '#' + tag,
                    };
                return { value: `/trending`, label: tt('g.all_tags') };
            };

            let options = [];
            options.push(opt(null));

            if (username) {
                options.push(opt('@' + username));
                options.push(opt('my'));
            }

            options = options.concat(
                topics.toJS().map(cat => opt(cat[0], cat[1]))
            );

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
        }

        const link = (url, label) => (
            <Link to={url} className="c-sidebar__link" activeClassName="active">
                {label}
            </Link>
        );

        const listItem = (body, className = 'c-sidebar__header') => (
            <li className="c-sidebar__list-item">
                <div className={className}>{body}</div>
            </li>
        );

        const moreLabel = <span>{tt('g.show_more_topics')}&hellip;</span>;

        const list = (
            <ul className="c-sidebar__list">
                {listItem(link('/trending', tt('g.all_tags')))}
                {username && listItem(link(`/@${username}/feed`, 'My friends'))}
                {username && listItem(link(`/trending/my`, 'My communities'))}
                <li className="c-sidebar__list-item">
                    <div style={{ color: '#aaa', paddingTop: '1em' }}>
                        Communities
                    </div>
                </li>
                {topics
                    .toJS()
                    .map(cat =>
                        listItem(
                            link(`/trending/${cat[0]}`, cat[1] || '#' + cat[0]),
                            ''
                        )
                    )}
                {listItem(
                    link(`/tags`, moreLabel),
                    'c-sidebar__link--emphasis'
                )}
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
