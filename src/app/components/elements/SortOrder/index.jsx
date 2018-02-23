import React, { Component } from 'react';
import PropTypes from 'prop-types';
import tt from 'counterpart';
import Select from 'react-select';
import { Link } from 'react-router';
import { browserHistory } from 'react-router';

const SortOrder = ({ topic, sortOrder, setSortOrder, horizontal }) => {
    const handleChange = topic => sort => {
        const route = topic ? `/${sort.value}/${topic}` : `/${sort.value}`;
        browserHistory.replace(route);
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
        <ul className="menu">
            {sorts(topic).map(i => {
                return (
                    <li
                        key={i.value}
                        className={i.value === sortOrder ? 'active' : ''}
                    >
                        <Link to={i.link}>{i.label}</Link>
                    </li>
                );
            })}
        </ul>
    ) : (
        <Select
            name="select-topic"
            className="react-select"
            value={sortOrder}
            onChange={handleChange(topic)}
            options={sorts(topic)}
            clearable={false}
        />
    );
};

SortOrder.propTypes = {};

SortOrder.defaultProps = {
    sortOrder: 'trending',
};

export default SortOrder;
