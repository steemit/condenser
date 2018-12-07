import React, { Component } from 'react';

import browsingHistory from 'assets/images/history.png';

class BrowsingHistory extends Component {
    constructor(props) {
        super(props);

        this.state = {
            // loading: true,
        };
    }

    render() {
        return (
            <div className="BrowsingHistoryWrapper">
                <div className="Title">BrowsingHistory: </div>
                <div className="Graph">
                    <img src={browsingHistory} alt="Browsing History" />
                </div>
            </div>
        );
    }
}

export default BrowsingHistory;
