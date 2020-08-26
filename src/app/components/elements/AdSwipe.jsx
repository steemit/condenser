import React, { Component } from 'react';
import { List } from 'immutable';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import SwiperCore, { Autoplay } from 'swiper';
import { recordAdsView } from 'app/utils/ServerApiClient';
import 'swiper/swiper.scss';

SwiperCore.use([Autoplay]);

class AdSwipe extends Component {
    constructor() {
        super();
        this.setRecordAdsView = this.setRecordAdsView.bind(this);
        this.onMouseOver = this.onMouseOver.bind(this);
        this.onMouseOut = this.onMouseOut.bind(this);
        this.state = {
            hide: true,
        };
        this.swiperEl;
        this.swiperInstance;
    }

    componentWillMount() {}

    componentDidMount() {
        const { width, height, direction, timer } = this.props;
        this.swiperInstance = new SwiperCore(this.swiperEl, {
            direction,
            speed: 1000,
            width,
            height,
            autoplay: {
                delay: timer,
            },
            spaceBetween: 10,
            loop: true,
        });
        this.setState({ hide: false });
    }

    setRecordAdsView(tag) {
        recordAdsView({
            trackingId: this.props.trackingId,
            adTag: tag,
        });
    }

    onMouseOver() {
        this.swiperInstance.autoplay.stop();
    }

    onMouseOut() {
        this.swiperInstance.autoplay.start();
    }

    render() {
        const { width, height, adList } = this.props;
        const { hide } = this.state;
        const swiperWrapperClass = `swiper-wrapper ${
            hide === true ? 'hide' : ''
        }`;
        return (
            <div
                className="ad-carousel swiper-container"
                ref={el => (this.swiperEl = el)}
                style={{
                    width: `${width}px`,
                    height: `${height}px`,
                }}
            >
                {adList.size > 0 && (
                    <div className={swiperWrapperClass}>
                        {adList.map(
                            (ad, inx) =>
                                ad.get('enable') && (
                                    <div key={inx} className="swiper-slide">
                                        <a
                                            target="_blank"
                                            href={ad.get('url')}
                                            onClick={() =>
                                                this.setRecordAdsView(
                                                    ad.get('tag')
                                                )
                                            }
                                            style={{
                                                width: `${width}px`,
                                                height: `${height}px`,
                                            }}
                                        >
                                            <img
                                                onMouseOut={this.onMouseOut}
                                                onMouseOver={this.onMouseOver}
                                                src={ad.get('img')}
                                                style={{
                                                    width: `${width}px`,
                                                    height: `${height}px`,
                                                }}
                                            />
                                        </a>
                                    </div>
                                )
                        )}
                    </div>
                )}
            </div>
        );
    }
}

AdSwipe.defaultProps = {
    trackingId: '',
    width: 240,
    height: 240,
    adList: List(),
    timer: 5000,
    direction: 'horizontal', // Could be 'horizontal' or 'vertical'
};

AdSwipe.propTypes = {
    trackingId: PropTypes.string.isRequired,
    adList: PropTypes.instanceOf(List).isRequired,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    timer: PropTypes.number.isRequired,
    direction: PropTypes.string.isRequired,
};

export default connect(
    (state, props) => {
        return {};
    },
    dispatch => ({})
)(AdSwipe);
