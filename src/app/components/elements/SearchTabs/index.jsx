import React, { Component } from 'react';
import PropTypes from 'prop-types';
import tt from 'counterpart';

class SearchTabs extends Component {
    constructor(props) {
        super();
    }

    handleClick(currentTab) {
        const { depth, sort, searchDepth } = this.props;
        if (currentTab === depth) return;
        searchDepth(currentTab);
        this.searchAgain(currentTab, sort);
    }

    handleSortChange(e) {
        const { depth, searchSort } = this.props;
        console.log('value:', e.target.value);
        searchSort(e.target.value);
        this.searchAgain(depth, e.target.value);
    }

    searchAgain(depth, sort) {
        const { params, handleTabChange } = this.props;
        handleTabChange({
            ...params,
            depth,
            sort,
        });
    }

    render() {
        const { depth } = this.props;
        return (
            <div className="search-nav">
                <ul className="search-tabs">
                    <li
                        className={depth === 0 ? 'active' : ''}
                        onClick={() => this.handleClick(0)}
                    >
                        帖子
                    </li>
                    <li
                        className={depth === 1 ? 'active' : ''}
                        onClick={() => this.handleClick(1)}
                    >
                        回复
                    </li>
                    <li
                        className={depth === 2 ? 'active' : ''}
                        onClick={() => this.handleClick(2)}
                    >
                        用户
                    </li>
                    <li
                        className="li-right"
                        style={depth === 2 ? { display: 'none' } : null}
                    >
                        <select
                            className="search-sort"
                            onChange={e => this.handleSortChange(e)}
                        >
                            <option value={'created_at'}>按时间排序</option>
                            <option value={'payout'}>按奖励排序</option>
                        </select>
                    </li>
                </ul>
            </div>
        );
    }
}

export default SearchTabs;
