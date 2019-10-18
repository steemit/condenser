import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { filterTags } from 'app/utils/StateFunctions';
import { ifHive } from 'app/utils/Community';
import DropdownMenu from 'app/components/elements/DropdownMenu';

function normalizeTags(json, category) {
    let tags = [];

    try {
        if (typeof json == 'object') {
            tags = json.tags || [];
        }
        if (!Array.isArray(tags)) {
            tags = [];
        }
    } catch (e) {
        tags = [];
    }

    // Category should always be first.
    tags.unshift(category);

    return filterTags(tags);
}

class TagList extends Component {
    render() {
        const { post, single } = this.props;

        const link = tag => {
            const name =
                (ifHive(tag) ? post.community_title : null) || '#' + tag;
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
                {normalizeTags(post.json_metadata, post.category).map(link)}
            </div>
        );
    }
}

export default connect(
    // mapStateToProps
    (state, ownProps) => ({
        post: ownProps.post,
        single: ownProps.single,
    })
)(TagList);
