import React, { Component } from 'react';
import { connect } from 'react-redux';

import { actions as fetchDataSagaActions } from 'app/redux/FetchDataSaga';

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
    path: ':order(/:category)',
    component: connect(
        (state, ownProps) => {
            return {
                discussions: state.global.get('discussion_idx'),
                status: state.global.get('status'),
                loading: state.app.get('loading'),
                accounts: state.global.get('accounts'),
                username:
                    state.user.getIn(['current', 'username']) ||
                    state.offchain.get('account'),
                blogmode: state.app.getIn(['user_preferences', 'blogmode']),
                sortOrder: ownProps.params.order,
                topic: ownProps.params.category,
                categories: state.global
                    .getIn(['tag_idx', 'trending'])
                    .take(50),
                maybeLoggedIn: state.user.get('maybeLoggedIn'),
                isBrowser: process.env.BROWSER,
            };
        },
        dispatch => {
            return {
                requestData: args =>
                    dispatch(fetchDataSagaActions.requestData(args)),
            };
        }
    )(Home),
};
