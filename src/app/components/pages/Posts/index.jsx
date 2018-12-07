import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';

import { connectPost } from '../../redux';
import { promisify } from '../../redux/utils';

class Posts extends Component {
    constructor(props) {
        super(props);

        this.state = {
            // loading: true,
        };
    }

    componentDidMount() {
        const { fetchPosts } = this.props;

        promisify(fetchPosts, {})
            .then(res => {
                console.log(res);
            })
            .catch(err => {
                console.log(err);
            });
    }

    render() {
        const { posts } = this.props;
        const postsData = posts.posts || [];

        return (
            <div className="PostsWrapper">
                <div className="Title">Posts</div>
                <table className="Posts">
                    <tbody>
                        {postsData.length > 0 ? (
                            postsData.map((post, index) => (
                                <tr key={`${index}-${post.name}`}>
                                    <td>{post.name}</td>
                                    <td>{post.date.toString()}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td>No Posts</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        );
    }
}

Posts.defaultProps = {
    posts: {},
};

Posts.propTypes = {
    posts: PropTypes.shape({
        posts: PropTypes.arrayOf(PropTypes.object),
    }),
    fetchPosts: PropTypes.func.isRequired,
};

export default compose(connectPost())(Posts);
