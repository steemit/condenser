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
        const { path } = this.props

        return (
            <a
                role="button"
                className="btn visit-app-btn"
                href={`golosioapp://${$STM_Config.site_domain}${path === '/' ? `/trending` : `${path}`}`}
            >
                {tt('mobile_app_button.open_in_app')}
            </a>
        );
    }
}
