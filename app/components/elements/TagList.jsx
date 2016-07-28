import React from 'react';
import { Link } from 'react-router';
import DropdownMenu from 'app/components/elements/DropdownMenu';

export default ({post}) => {
    let json = post.json_metadata;
    let tags = []

    try {
        if(typeof json == 'object') {
            tags = json.tags || []
        } else {
            tags = json && JSON.parse(json).tags || [];
        }
    } catch(e) {
        tags = []
    }

    // Category should always be first.
    tags.unshift(post.category)

    // Uniqueness filter.
    tags = tags.filter( (value, index, self) => value && (self.indexOf(value) === index) )

    if(tags.legth == 0) {
        return <span>unknown</span>
    } else if(tags.length == 1) {
        return <Link to={`/trending/${tags[0]}`}>{tags[0]}</Link>
    } else {
        const list = tags.map( function(tag) {return {value: tag, link: '/trending/' + tag}} );
        return <DropdownMenu selected={' '+tags[0]} className="TagList" items={list} el="div" />;
    }
}
