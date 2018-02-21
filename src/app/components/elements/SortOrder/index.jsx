import React, { Component } from 'react';
import PropTypes from 'prop-types';
import tt from 'counterpart';
import Select from 'react-select';
import { browserHistory } from 'react-router';

const SortOrder = ({ current }) => {
    const handleChange = currentTopic => selectedOption => {
        browserHistory.push(`${selectedOption.value}/${currentTopic}`);
    };

    console.log(current);

    const selectItems = [
        {
            value: '/trending',
            label: tt('main_menu.trending'),
        },
        {
            value: '/created',
            label: tt('g.new'),
        },
        {
            value: '/hot',
            label: tt('main_menu.hot'),
        },
        {
            value: '/promoted',
            label: tt('g.promoted'),
        },
    ];

    return (
        <Select
            name="select-topic"
            className="react-select"
            value={`/${current}`}
            onChange={handleChange(current)}
            options={selectItems}
            clearable={false}
        />
    );
};

SortOrder.propTypes = {
    current: PropTypes.string,
};

SortOrder.defaultProps = {
    current: 'trending',
};

export default SortOrder;
