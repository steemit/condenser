import React from 'react';
import { Link } from 'react-router';
import DropdownMenu from 'app/components/elements/DropdownMenu';
import { detransliterate } from 'app/utils/ParsersAndFormatters';

export default ({post, horizontal, single}) => {
    let sort_order = 'trending';
    if (process.env.BROWSER && window.last_sort_order) sort_order = window.last_sort_order;

    if (single) return <strong><Link to={`/${sort_order}/${post.category}`}>{detransliterate(post.category)}</Link></strong>;

    const json = post.json_metadata;
    let tags = []

    try {
        if(typeof json == 'object') {
            tags = json.tags || []
        } else {
            tags = json && JSON.parse(json).tags || [];
        }
        if(typeof tags == 'string') tags = tags.split(' ');
        if(!Array.isArray(tags)) {
            tags = [];
        }
    } catch(e) {
        tags = []
    }

    // Category should always be first.
    tags.unshift(post.category)

    // Uniqueness filter.
    tags = tags.filter( (value, index, self) => value && (self.indexOf(value) === index) )

    if (horizontal) { // show it as a dropdown in Preview
        const list = tags.map( (tag, idx) => <Link to={`/${sort_order}/${tag}`} key={idx}> {detransliterate(tag)} </Link>)
        return <div className="TagList__horizontal">{list}</div>;
    }
    if(tags.length == 1) {
        return <Link to={`/${sort_order}/${tags[0]}`}>{detransliterate(tags[0])}</Link>
    }
    const list = tags.map(tag => {return {value: detransliterate(tag), link: `/${sort_order}/${tag}`}});
    return <DropdownMenu selected={' '+ detransliterate(tags[0])} className="TagList" items={list} el="div" />;
}
