import React, {Component, PropTypes} from "react";
import AndroidMarket from "./AndroidMarket"

export default class MobileBanners extends Component {

    static propTypes = {
        showAndroid: React.PropTypes.bool,
        showiOS: React.PropTypes.bool
    };

    render() {
        let {showAndroid, showiOS} = this.props

        return <div className='mobile-banners-wrapper hide-for-small-only'>
                {showAndroid ? <AndroidMarket /> : null}
                {showiOS ? <AndroidMarket /> : null}
            </div>        
    }
}
