import React, { Component } from 'react';

class Claim extends Component {
    constructor(props) {
        super(props);

        this.state = {
            // loading: true,
        };
    }

    render() {
        return (
            <div className="ClaimWrapper">
                <div className="Title">Settings -- Claim</div>
            </div>
        );
    }
}

export default Claim;
