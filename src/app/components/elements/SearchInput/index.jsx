import React from 'react';
import PropTypes from 'prop-types';
import tt from 'counterpart';

const SearchInput = ({ type }) => {
    return (
        <span>
            <form
                className={'search-input'}
                action="/static/search.html"
                method="GET"
            >
                <svg
                    className="search-input__icon"
                    width="42"
                    height="42"
                    viewBox="0 0 32 32"
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <g>
                        <path
                            className="search-input__path"
                            d="M14.3681591,18.5706017 L11.3928571,21.6 L14.3681591,18.5706017 C13.273867,17.6916019 12.5714286,16.3293241 12.5714286,14.8 C12.5714286,12.1490332 14.6820862,10 17.2857143,10 C19.8893424,10 22,12.1490332 22,14.8 C22,17.4509668 19.8893424,19.6 17.2857143,19.6 C16.1841009,19.6 15.1707389,19.215281 14.3681591,18.5706017 Z"
                            id="icon-svg"
                        />
                    </g>
                </svg>
                <input
                    name="q"
                    className="search-input__inner"
                    type="search"
                    placeholder={tt('g.search')}
                />
                <button
                    className="input-group-button"
                    href="/static/search.html"
                    type="submit"
                    title={tt('g.search')}
                />
            </form>
        </span>
    );
};

export default SearchInput;
