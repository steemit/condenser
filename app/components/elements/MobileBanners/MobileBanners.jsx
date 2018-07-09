import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import AndroidMarket from './AndroidMarket';
import './MobileBanners.scss';

export default class MobileBanners extends PureComponent {
    static propTypes = {
        showAndroid: PropTypes.bool,
        showiOS: PropTypes.bool,
    };

    render() {
        const { showAndroid, showiOS } = this.props;

        return (
            <div className="mobile-banners-wrapper">
                {showAndroid ? <AndroidMarket /> : null}
                {showiOS ? <AndroidMarket /> : null}
            </div>
        );
    }
}
