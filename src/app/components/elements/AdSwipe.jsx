import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import ReactSwipe from 'react-swipe';
import { recordAdsView } from 'app/utils/ServerApiClient';

class AdSwipe extends Component {
    constructor() {
        super();
        this.setRecordAdsView = this.setRecordAdsView.bind(this);
    }

    componentWillMount() {}

    setRecordAdsView(tag) {
        recordAdsView({
            trackingId: this.props.trackingId,
            adTag: tag,
        });
    }

    render() {
        const { width, height, adList } = this.props;
        const swipeOpt = {
            speed: 3000,
            auto: 3000,
        };
        return (
            <div className="ad-carousel">
                <ReactSwipe swipeOptions={swipeOpt}>
                    {adList.map(
                        (ad, inx) =>
                            ad.enable && (
                                <a
                                    key={inx}
                                    target="_blank"
                                    href={ad.url}
                                    onClick={() =>
                                        this.setRecordAdsView(ad.tag)
                                    }
                                >
                                    <img
                                        key={inx}
                                        src={ad.img}
                                        width={width}
                                        height={height}
                                    />
                                </a>
                            )
                    )}
                </ReactSwipe>
            </div>
        );
    }
}

AdSwipe.propTypes = {
    trackingId: PropTypes.string.isRequired,
    adList: PropTypes.array,
    width: PropTypes.number,
    height: PropTypes.number,
};

export default connect(
    (state, props) => {
        return {};
    },
    dispatch => ({})
)(AdSwipe);
