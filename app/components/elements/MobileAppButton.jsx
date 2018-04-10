import React, {Component} from 'react';
import { ANDROID_APP_URL } from '@config';

class MobileAppButton extends Component {
    onClick = () => {
        localStorage.setItem('golos_app_page_visited', true)
        window.location.assign(ANDROID_APP_URL)
    }

    render() {
        const android = navigator && navigator.userAgent.match(/Android/i)
        const visited = localStorage.getItem('golos_app_page_visited')

        return (android && !visited)
            ? <div role="button" onClick={this.onClick} className="btn visit-app-btn">Открыть в приложении</div>
            : null
    }
}

export default MobileAppButton
