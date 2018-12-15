import React, { Component } from 'react';
// import { Link } from 'react-router';

// import { SideMenu } from 'app/components/pages/_Common';
import { SearchHeader, SearchItem, SearchRelatedItem } from './Components';

import { SearchItems, RelatedItems } from './DummyData';

class Home extends Component {
    constructor(props) {
        super(props);

        this.state = {
            // loading: true,
            isPaneOpen: true,
        };
    }

    render() {
        const { search } = this.props;
        // const { items, relatedItems } = search || {};
        const { isPaneOpen } = this.state;

        return (
            <div className={`HomeWrapper ${isPaneOpen ? 'Open' : 'Close'}`}>
                <div className="Content">
                    <div className="Results">
                        <SearchHeader />
                        {SearchItems.map((item, index) => (
                            <SearchItem
                                data={item}
                                key={`${index}-${item.id}`}
                            />
                        ))}
                    </div>
                </div>
                <div className="RelatedItems">
                    <h1>Related</h1>
                    {RelatedItems.map((item, index) => (
                        <SearchRelatedItem
                            data={item}
                            key={`${index}-${item.id}`}
                        />
                    ))}
                    <div className="More">
                        <a href="/?search=more">See more related topics</a>
                    </div>
                </div>
            </div>
        );
    }
}

module.exports = {
    path: 'static_home',
    component: Home,
};
