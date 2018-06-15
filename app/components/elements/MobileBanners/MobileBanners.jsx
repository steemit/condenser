import React, {Component} from "react";
import PropTypes from 'prop-types'
import AndroidMarket from "./AndroidMarket"

export default class MobileBanners extends Component {

    static propTypes = {
        showAndroid: PropTypes.bool,
        showiOS: PropTypes.bool
    };

    render() {
        let {showAndroid, showiOS} = this.props

        return <div className='mobile-banners-wrapper'>
                {showAndroid ? <AndroidMarket /> : null}
                {showiOS ? <AndroidMarket /> : null}
            </div>        
    }
}
