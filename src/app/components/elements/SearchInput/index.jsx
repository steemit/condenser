import React from 'react';
import tt from 'counterpart';
import Icon from 'app/components/elements/Icon';

const SearchInput = () => (
    <ul>
        <li className={'hide-for-large Header__search'}>
            <a href="/static/search.html" title={tt('g.search')}>
                <Icon name="search" size="1x" />
            </a>
        </li>
        <li className={'show-for-large Header__search'}>
            <form
                className="input-group"
                action="/static/search.html"
                method="GET"
            >
                <button
                    className="input-group-button"
                    href="/static/search.html"
                    type="submit"
                    title={tt('g.search')}
                >
                    <Icon name="search" size="1_5x" />
                </button>
                <input
                    className="input-group-field"
                    type="text"
                    placeholder="search"
                    name="q"
                    autoComplete="off"
                />
            </form>
        </li>
    </ul>
);

export default SearchInput;
