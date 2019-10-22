import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { normalizeTags } from 'app/utils/StateFunctions';
import DropdownMenu from 'app/components/elements/DropdownMenu';

class TagList extends Component {
    render() {
        const { post, single } = this.props;
        const category = post.get('category');

        const link = tag => {
            const primary = tag === category && post.get('community_title');
            const name = primary || '#' + tag;
            return <Link to={`/trending/${tag}`} key={tag}>{` ${name} `}</Link>;
        };

        if (single) return link(category);

        return (
            <div className="TagList__horizontal">
                {normalizeTags(post.get('json_metadata'), category).map(link)}
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
