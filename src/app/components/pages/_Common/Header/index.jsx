import React, { Component } from 'react';

class Header extends Component {
    constructor(props) {
        super(props);

        this.state = {
            // loading: true,
        };
    }

    render() {
        return (
            <div className="HeaderWrapper">
                <div className="Title">Header</div>
            </div>
        );
    }
}

export default Header;
