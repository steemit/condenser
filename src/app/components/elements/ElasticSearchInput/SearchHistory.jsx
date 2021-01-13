import React from 'react';
import tt from 'counterpart';

class SearchHistory extends React.Component {
    handleClick(text) {
        this.props.setSearchText(text);
        this.props.changeHistory(false);
    }

    clearHistory() {
        window.localStorage.removeItem('steemit_search');
        this.props.changeHistory(false);
    }

    render() {
        const history = window.localStorage.getItem('steemit_search');
        if (!history) return null;
        return (
            <ul
                className="search-history"
                style={{ display: `${this.props.show ? 'block' : 'none'}` }}
            >
                <li className="search-history-first">
                    <span>{tt('g.search_history')}</span>
                    <span
                        className="search-history-clear"
                        onClick={() => this.clearHistory()}
                    >
                        {tt('g.clear')}
                    </span>
                </li>
                {history.split(',').map((item, index) => {
                    if (index > 7) return;
                    return (
                        <li key={index} onClick={() => this.handleClick(item)}>
                            {item}
                        </li>
                    );
                })}
            </ul>
        );
    }
}

export default SearchHistory;
