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
        this.getHeight = this.getHeight.bind(this);
        this.state = {
            hide: true,
        };
        this.heightState;
        this.swiperInstance;
    }

    componentWillMount() {}

    componentDidMount() {
        this.initSwiper();
        this.setState({ hide: false });
    }

    initSwiper() {
        const { direction, timer } = this.props;
        this.swiperInstance = new SwiperCore(this.refs.swiperEl, {
            direction,
            speed: 1000,
            autoplay: {
                delay: timer,
                disableOnInteraction: false,
            },
            spaceBetween: 10,
            loop: true,
            on: {
                init: e => {
                    if (direction === 'horizontal') return;
                    this.setState({
                        heightState: this.getHeight(e.$el[0].clientWidth),
                    });
                },
                resize: e => {
                    if (direction === 'horizontal') return;
                    this.setState({
                        heightState: this.getHeight(e.$el[0].clientWidth),
                    });
                },
            },
        });
    }

    getHeight(width) {
        const rate = 864 / 86;
        return (width / rate).toFixed(1);
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
        const { width, adList } = this.props;
        const { hide, heightState } = this.state;
        const swiperWrapperClass = `swiper-wrapper ${
            hide === true ? 'hide' : ''
        }`;
        return (
            <div
                className="ad-carousel swiper-container"
                ref="swiperEl"
                style={{
                    width,
                    height: `${heightState}px`,
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
                                        >
                                            <img
                                                onMouseOut={this.onMouseOut}
                                                onMouseOver={this.onMouseOver}
                                                src={ad.get('img')}
                                                style={{
                                                    width,
                                                    height: `${heightState}px`,
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
    width: '100%',
    height: 'auto',
    adList: List(),
    timer: 5000,
    direction: 'horizontal', // Could be 'horizontal' or 'vertical'
};

AdSwipe.propTypes = {
    trackingId: PropTypes.string.isRequired,
    adList: PropTypes.instanceOf(List).isRequired,
    width: PropTypes.string,
    height: PropTypes.string,
    timer: PropTypes.number.isRequired,
    direction: PropTypes.string.isRequired,
};

export default connect(
    (state, props) => {
        return {};
    },
    dispatch => ({})
)(AdSwipe);
