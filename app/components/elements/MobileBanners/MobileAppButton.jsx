import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import tt from 'counterpart';
import settings from './settings';

export default class MobileAppButton extends Component {
    shouldComponentUpdate() {
        return false;
    }
    render() {
        if (!process.env.BROWSER) {
            return null;
        }
        
        const android = navigator.userAgent.match(/android/i);

        if (!android) {
            return null;
        }

        return (
            <div
                role="button"
                className="btn visit-app-btn"
                onClick={e =>this._onClick(this.props.path)}
            >
                {tt('mobile_app_button.open_in_app')}
            </div>
        );
    }

    _onClick = (path) => {
        browserHistory.push(`/app${path}`)
    };
}
