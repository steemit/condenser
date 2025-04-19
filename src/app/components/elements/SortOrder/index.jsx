import React, { Component } from 'react';
import PropTypes from 'prop-types';
import tt from 'counterpart';
import { Link } from 'react-router';
import { browserHistory } from 'react-router';
import NativeSelect from 'app/components/elements/NativeSelect';

const SortOrder = ({ topic, sortOrder, horizontal, pathname }) => {
    let tag = topic || '';
    let sort = sortOrder;

    if (sort === 'feed') {
        tag = '';
        sort = 'created';
    }

    if (pathname === '/') {
        tag = '';
        sort = 'trending';
    }

    const sorts = (tag, topMenu = false) => {
        if (tag != '') tag = `/${tag}`;

        let out = [
            {
                label: tt('main_menu.trending'),
                value: `/trending${tag}`,
            },
            {
                label: tt('main_menu.hot'),
                value: `/hot${tag}`,
            },
        ];

        if (!topMenu) {
            out.push({
                label: tt('g.new'),
                value: `/created${tag}`,
            });

            /*
            out.push({
                label: tt('g.promoted'),
                value: `/promoted${tag}`,
            });
            */

            out.push({
                label: tt('g.payouts'),
                value: `/payout${tag}`,
            });

            out.push({
                label: tt('g.muted'),
                value: `/muted${tag}`,
            });
        }

        return out;
    };

    // vertical dropdown
    if (!horizontal) {
        const url = (sort, tag = null) =>
            tag ? `/${sort}/${tag}` : `/${sort}`;
        return (
            <NativeSelect
                currentlySelected={url(sort, tag)}
                options={sorts(tag, false)}
                onChange={el => browserHistory.replace(el.value)}
            />
        );
    }

    // site header
    return (
        <ul className="nav__block-list">
            {sorts('', true).map(i => {
                const active = i.value === `/${sort}`;
                const cls = active ? 'nav__block-list-item--active' : '';
                return (
                    <li key={i.value} className={`nav__block-list-item ${cls}`}>
                        <Link to={i.value}>{i.label}</Link>
                    </li>
                );
            })}
        </ul>
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
