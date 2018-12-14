import React, { Component } from 'react';

class Settings extends Component {
    constructor(props) {
        super(props);

        this.state = {
            // loading: true,
        };
    }

    render() {
        return (
            <div className="SettingsWrapper">
                <div className="Title">Settings</div>
            </div>
        );
    }
}

export default Settings;
