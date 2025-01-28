import React from 'react';
import { Link } from 'react-router';

const Tag = ({ post }) => {
    const tag = post.get('category');
    const name = post.get('community_title', '#' + tag);
    return (
        <Link to={`/created/${tag}`} key={tag}>
            {name}
        </Link>
    );
};

export default Tag;
