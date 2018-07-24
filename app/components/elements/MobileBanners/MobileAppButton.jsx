import React, { Component } from 'react';
import tt from 'counterpart';
import { ANDROID_PACKAGE } from 'app/client_config';

export default class MobileAppButton extends Component {
    shouldComponentUpdate(np) {
        return this.props.path != np.path;
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
       
        const redirectToApp = (path) => {
            const iframe = document.createElement("iframe");
            iframe.src = `golosioapp://${$STM_Config.site_domain}${path === '/' ? `/trending` : `${path}`}`;
            document.body.appendChild(iframe);
        }

        return (
            <div
                role="button"
                className="btn visit-app-btn"
                onClick={
                    e => {
                        console.log(path)
                        redirectToApp(path)
                        setTimeout(
                            () => window.location.replace(`market://details?id=${ANDROID_PACKAGE}`),
                            250
                        )
                    }
                }
            >
                {tt('mobile_app_button.open_in_app')}
            </div>
        );
    }
}
