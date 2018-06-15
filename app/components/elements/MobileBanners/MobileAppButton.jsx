import React, {Component} from 'react';
import settings from './settings'

class MobileAppButton extends Component {
    onClick = () => {
        window.location.assign(settings.android.market_source)
    }

    render() {
        if (!process.env.BROWSER) return null

        const android = navigator.userAgent.match(/Android/i)

        return (android)
            ? <div role="button" onClick={this.onClick} className="btn visit-app-btn">Открыть в приложении</div>
            : null
    }
}

export default MobileAppButton