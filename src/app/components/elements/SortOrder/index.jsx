import React, { Component } from 'react';
import PropTypes from 'prop-types';
import tt from 'counterpart';
import DropdownMenu from 'app/components/elements/DropdownMenu';

const SortOrder = ({ sortOrder, topic }) => {
    const sortOrderToLink = (so, topic = 'feed') => {
        const routes = {
            trending: '/trending',
            created: '/created',
            hot: '/hot',
            promoted: '/promoted',
        };
        let route =
            topic !== 'feed' && so !== 'home'
                ? `${routes[so]}/${topic}`
                : `${routes[so]}`;
        return route;
    };
    const sort_orders = [
        ['trending', tt('main_menu.trending')],
        ['created', tt('g.new')],
        ['hot', tt('main_menu.hot')],
        ['promoted', tt('g.promoted')],
    ];

    const sort_order_menu = sort_orders
        .filter(so => so[0] !== sortOrder)
        .map(so => ({
            link: sortOrderToLink(so[0], topic),
            value: so[1],
        }));

    const selected_sort_order = sort_orders.find(so => so[0] === sortOrder);

    const actuallySelected = !selected_sort_order
        ? ['trending', tt('main_menu.trending')] // This will have to default to trending.
        : selected_sort_order;

    const sort_order_menu_horizontal = sort_orders.map(so => {
        let active = so[0] === sortOrder;
        if (so[0] === 'home' && sortOrder === 'home' && !home_account)
            active = false;
        return {
            link: sortOrderToLink(so[0], topic),
            value: so[1],
            active,
        };
    });

    return (
        <span>
            <DropdownMenu
                className="Header__sort-order-menu"
                items={sort_order_menu}
                selected={actuallySelected[1]}
                el="li"
            />
        </span>
    );
};

SortOrder.propTypes = {
    sortOrder: PropTypes.string,
    topic: React.PropTypes.string,
};

SortOrder.defaultProps = {
    sortOrder: 'trending',
    topic: undefined,
};

export default SortOrder;
