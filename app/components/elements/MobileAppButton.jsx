import React, {Component} from 'react';

class MobileAppButton extends Component {
    onClick = () => {
        localStorage.setItem('golos_app_page_visited', true)
        window.location.replace("https://play.google.com/store/apps/details?id=io.golos.golos")
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
