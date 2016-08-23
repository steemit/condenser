import React from 'react';
import { Link } from 'react-router';
import DropdownMenu from 'app/components/elements/DropdownMenu';

export default ({post, horizontal}) => {
    let sort_order = 'trending';
    if (process.env.BROWSER && window.last_sort_order) sort_order = window.last_sort_order;
    if (!horizontal) return <strong><Link to={`/${sort_order}/${post.category}`}>{post.category}</Link></strong>;

    let json = post.json_metadata;
    let tags = []

    try {
        if(typeof json == 'object') {
            tags = json.tags || []
        } else {
            tags = json && JSON.parse(json).tags || [];
        }
        if(typeof tags == 'string') tags = tags.split(' ');
    } catch(e) {
        tags = []
    }

    // Category should always be first.
    tags.unshift(post.category)

    // Uniqueness filter.
    tags = tags.filter( (value, index, self) => value && (self.indexOf(value) === index) )

    if (horizontal) { // show it as a dropdown in Preview
        const list = tags.map( (tag,idx) => <Link to={`/${sort_order}/${tag}`} key={idx}> {tag} </Link>)
        return <div className="TagList__horizontal">{list}</div>;
    } else {
        if(tags.length == 1) {
            return <Link to={`/${sort_order}/${tags[0]}`}>{tags[0]}</Link>
        } else {
            const list = tags.map(function (tag) {return {value: tag, link: `/${sort_order}/${tag}`}});
            return <DropdownMenu selected={' '+tags[0]} className="TagList" items={list} el="div" />;
        }
    }
}
