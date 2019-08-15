import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { filterTags } from 'app/utils/StateFunctions';
import DropdownMenu from 'app/components/elements/DropdownMenu';

function normalizeTags(post) {
    const json = post.json_metadata;
    let tags = [];

    try {
        if (typeof json == 'object') {
            tags = json.tags || [];
        } else {
            tags = (json && JSON.parse(json).tags) || [];
        }
        if (typeof tags == 'string') tags = tags.split(' ');
        if (!Array.isArray(tags)) {
            tags = [];
        }
    } catch (e) {
        tags = [];
    }

    // Category should always be first.
    tags.unshift(post.category);

    return filterTags(tags);
}

class TagList extends Component {
    render() {
        const { post, single, communities } = this.props;

        const link = tag => {
            const name = communities.getIn([tag, 'title'], '#' + tag);
            return (
                <Link to={`/trending/${tag}`} key={tag}>
                    {' '}
                    {name}{' '}
                </Link>
            );
        };

        if (single) return link(post.category);

        return (
            <div className="TagList__horizontal">
                {normalizeTags(post).map(link)}
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
)(TagList);
