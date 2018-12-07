import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withCookies } from 'react-cookie';
import { withRouter } from 'react-router';
import { Link } from 'react-router-dom';
// import { Anchor } from 'react-feather';
import 'react-sliding-pane/dist/react-sliding-pane.css';

import { SideMenu } from 'components/_Common';
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

    componentDidMount() {
        const { cookies } = this.props;
        if (cookies.get('token')) {
            //
        } else {
            this.props.history.push('/login');
        }
    }

    render() {
        const { location, search } = this.props;
        const { items, relatedItems } = search;
        const { isPaneOpen } = this.state;

        return (
            <div className={`HomeWrapper ${isPaneOpen ? 'Open' : 'Close'}`}>
                <div className="Content">
                    <div className="Results">
                        <SearchHeader location={location} />
                        {items.map((item, index) => (
                            <SearchItem
                                data={item}
                                key={`${index}-${item.id}`}
                            />
                        ))}
                    </div>
                </div>
                <div className="RelatedItems">
                    <h1>Related</h1>
                    {relatedItems.map((item, index) => (
                        <SearchRelatedItem
                            data={item}
                            key={`${index}-${item.id}`}
                        />
                    ))}
                    <div className="More">
                        <Link to="/?search=more">See more related topics</Link>
                    </div>
                </div>
            </div>
        );
    }
}

Home.defaultProps = {
    search: {
        items: SearchItems,
        relatedItems: RelatedItems,
    },
};

Home.propTypes = {
    cookies: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    search: PropTypes.object,
};

export default withCookies(withRouter(Home));
