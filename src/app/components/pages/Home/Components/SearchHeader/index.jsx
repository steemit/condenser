import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { DropDown } from 'app/components/pages/_Common';

class SearchHeader extends Component {
  constructor(props) {
    super(props);

    this.state = {
      // loading: true,
      sortBy: null,
    };
  }

  getQuery(key) {
    return key;
  }

  render() {
    const { hasSearch } = this.props;
    return (
      <div className="SearchHeaderWrapper">
        <div>
          {hasSearch && (
            <div className="Title">
              Search Results: <span>{`"${hasSearch}"`}</span>
            </div>
          )}
        </div>
        <DropDown
          valueKey="value"
          defaultValue="Sort By"
          value={this.state.sortBy}
          options={[
            { label: 'Latest', value: 'latest' },
            { label: 'Top Votes', value: 'top_votes' },
          ]}
          onChange={value => this.setState({ sortBy: value })}
        />
      </div>
    );
  }
}

export default SearchHeader;
