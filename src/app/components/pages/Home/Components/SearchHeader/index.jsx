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

    componentDidMount() {
        // console.log(this.getParams('id'));
    }

    getQuery(key) {
        const { location: { search } } = this.props;
        const query = new URLSearchParams(search);
        return query.get(key);
    }

    render() {
        return (
            <div className="SearchHeaderWrapper">
                <div className="Title">
                    Search Results:{' '}
                    <span>{`"Who's really pushing '${this.getQuery(
                        'search'
                    )}'?"`}</span>
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

SearchHeader.propTypes = {
    location: PropTypes.object.isRequired,
};

export default SearchHeader;
