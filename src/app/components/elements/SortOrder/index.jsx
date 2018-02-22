import React, { Component } from 'react';
import PropTypes from 'prop-types';
import tt from 'counterpart';
import Select from 'react-select';
import { browserHistory } from 'react-router';

const SortOrder = ({ topic, currentSort, setSortOrder }) => {

    const handleChange = currentTopic => selectedOption => {
        setSortOrder(selectedOption.value, currentTopic)
    };

    const selectItems = [
        {
            value: 'trending',
            label: tt('main_menu.trending'),
        },
        {
            value: 'created',
            label: tt('g.new'),
        },
        {
            value: 'hot',
            label: tt('main_menu.hot'),
        },
        {
            value: 'promoted',
            label: tt('g.promoted'),
        },
    ];

    return (
        <Select
            name="select-topic"
            className="react-select"
            value={currentSort}
            onChange={handleChange(topic)}
            //onChange={setSortOrder}
            options={selectItems}
            clearable={false}
        />
    );
};

SortOrder.propTypes = {
};

SortOrder.defaultProps = {
};

export default SortOrder;
