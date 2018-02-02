import React, { Component } from 'react';
import PropTypes from 'prop-types';
import tt from 'counterpart';
import { Link } from 'react-router';
import { browserHistory } from 'react-router';
import NativeSelect from 'app/components/elements/NativeSelect';

const SortOrder = ({ topic, sortOrder, horizontal }) => {
    const makeRoute = (topic, sort) =>
        topic ? `/${sort.value}/${topic}` : `/${sort.value}`;

    const handleChange = topic => sort => {
        browserHistory.replace(makeRoute(topic, sort));
    };

    const sorts = topic => [
        {
            value: 'trending',
            label: tt('main_menu.trending'),
            link: `/trending/${topic}`,
        },
        {
            value: 'created',
            label: tt('g.new'),
            link: `/created/${topic}`,
        },
        {
            value: 'hot',
            label: tt('main_menu.hot'),
            link: `/hot/${topic}`,
        },
        {
            value: 'promoted',
            label: tt('g.promoted'),
            link: `/promoted/${topic}`,
        },
    ];

    return horizontal ? (
        <ul className="nav__block-list">
            {sorts(topic).map(i => {
                return (
                    <li
                        key={i.value}
                        className={`nav__block-list-item ${
                            i.value === sortOrder
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
            currentlySelected={sortOrder}
            options={sorts(topic)}
            onChange={handleChange(topic)}
        />
    );
};

SortOrder.propTypes = {
    topic: PropTypes.string,
    sortOrder: PropTypes.string,
    horizontal: PropTypes.bool,
};

SortOrder.defaultProps = {
    horizontal: false,
    topic: '',
    sortOrder: 'trending',
};

export default SortOrder;
