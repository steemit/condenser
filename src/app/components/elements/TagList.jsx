import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { normalizeTags } from 'app/utils/StateFunctions';

class TagList extends Component {
    render() {
        const { post } = this.props;
        const category = post.get('category');

        const link = tag => {
            if (tag == category) return null;
            return <Link to={`/trending/${tag}`} key={tag}>{` #${tag} `}</Link>;
        };

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
    })
)(TagList);
