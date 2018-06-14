import React, {Component} from 'react';
const ANDROID_APP_URL = 'https://play.google.com/store/apps/details?id=io.golos.golos';

class MobileAppButton extends Component {
    onClick = () => {
        localStorage.setItem('golos_app_page_visited', true)
        window.location.assign(ANDROID_APP_URL)
    }

    render() {
        if (!process.env.BROWSER) return null

        const android = navigator.userAgent.match(/Android/i)
        const visited = localStorage.getItem('golos_app_page_visited')

        return (android && !visited)
            ? <div role="button" onClick={this.onClick} className="btn visit-app-btn">Открыть в приложении</div>
            : null
    }
}

export default MobileAppButton