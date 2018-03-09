import React, { Component } from 'react';
import PropTypes from 'prop-types';
import tt from 'counterpart';
import { Link } from 'react-router';
import { browserHistory } from 'react-router';
import NativeSelect from 'app/components/elements/NativeSelect';

const SortOrder = ({ topic, sortOrder, horizontal, pathname }) => {
    /*
     * We do not sort the user feed by anything other than 'new'.
     * So don't make links to it from the SortOrder component.
     * Instead fall back to the 'all tags' route when a user attempts to sort from a feed page.
     * If a user lands on the 'feed' page and the sort order is displayed (e.g. a mobile user) 
     * display the active sort as 'new'.
     */
    let tag = topic;
    let sort = sortOrder;

    if (topic === 'feed') {
        tag = '';
        sort = 'created';
    }

    // If we are at the homepage, the sort order is 'trending'
    if (pathname === '/') {
        tag = '';
        sort = 'trending';
    }

    const makeRoute = (tag, sort) =>
        tag ? `/${sort.value}/${tag}` : `/${sort.value}`;

    const handleChange = tag => sort => {
        browserHistory.replace(makeRoute(tag, sort));
    };

    const sorts = tag => {
        return [
            {
                value: 'trending',
                label: tt('main_menu.trending'),
                link: `/trending/${tag}`,
            },
            {
                value: 'created',
                label: tt('g.new'),
                link: `/created/${tag}`,
            },
            {
                value: 'hot',
                label: tt('main_menu.hot'),
                link: `/hot/${tag}`,
            },
            {
                value: 'promoted',
                label: tt('g.promoted'),
                link: `/promoted/${tag}`,
            },
        ];
    };

    return horizontal ? (
        <ul className="nav__block-list">
            {sorts(tag).map(i => {
                return (
                    <li
                        key={i.value}
                        className={`nav__block-list-item ${
                            i.value === sort
                                ? 'nav__block-list-item--active'
                                : ''
                        }`}
                    >
                        <Link to={i.link}>{i.label}</Link>
                    </li>
                );
            })}
        </ul>
    ) : (
        <NativeSelect
            currentlySelected={sort}
            options={sorts(tag)}
            onChange={handleChange(tag)}
        />
    );
};

SortOrder.propTypes = {
    topic: PropTypes.string,
    sortOrder: PropTypes.string,
    horizontal: PropTypes.bool,
    pathname: PropTypes.string,
};

SortOrder.defaultProps = {
    horizontal: false,
    topic: '',
    sortOrder: '',
    pathname: '',
};

export default SortOrder;
