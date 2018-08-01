import React, { Component } from 'react';
import { ANDROID_PACKAGE } from 'app/client_config';
import OpenMobileAppButton from 'src/app/components/common/OpenMobileAppButton';

const STORE_KEY = 'golos.hideOpenAppLink';

let hide = false;

if (process.env.BROWSER) {
    hide = Boolean(localStorage.getItem(STORE_KEY));
}

export default class MobileAppButton extends Component {
    shouldComponentUpdate(np) {
        return this.props.path !== np.path;
    }

    render() {
        if (!process.env.BROWSER) {
            return null;
        }

        if (hide || !navigator.userAgent.match(/android/i)) {
            return null;
        }

        return (
            <OpenMobileAppButton
                onClick={this._onClick}
                onHide={this._onHide}
                onHideForever={this._onHideForever}
            />
        );
    }

    _onClick = () => {
        const { path } = this.props;

        const iframe = document.createElement('iframe');
        iframe.src = `golosioapp://${$STM_Config.site_domain}${
            path === '/' ? '/trending' : path
        }`;
        document.body.appendChild(iframe);

        setTimeout(() => {
            window.location.replace(`market://details?id=${ANDROID_PACKAGE}`);
        }, 250);
    };

    _onHide = () => {
        hide = true;
        this.forceUpdate();
    };

    _onHideForever = () => {
        hide = true;
        localStorage.setItem(STORE_KEY, '1');
        this.forceUpdate();
    };
}
