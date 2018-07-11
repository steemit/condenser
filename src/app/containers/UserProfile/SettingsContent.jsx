import React, { Component } from 'react';
import { connect } from 'react-redux';

import { SettingsShow } from 'src/app/components/userProfile';

class SettingsContent extends Component {

    render() {
        return (
            <SettingsShow/>
        );
    }
}

export default SettingsContent;
