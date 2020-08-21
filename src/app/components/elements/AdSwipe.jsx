import React, { Component } from 'react';
import { List } from 'immutable';
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
                    {adList.size > 0 &&
                        adList.map(
                            (ad, inx) =>
                                ad.get('enable') && (
                                    <a
                                        key={inx}
                                        target="_blank"
                                        href={ad.get('url')}
                                        onClick={() =>
                                            this.setRecordAdsView(ad.get('tag'))
                                        }
                                    >
                                        <img
                                            key={inx}
                                            src={ad.get('img')}
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
    adList: PropTypes.instanceOf(List),
    width: PropTypes.number,
    height: PropTypes.number,
};

export default connect(
    (state, props) => {
        return {};
    },
    dispatch => ({})
)(AdSwipe);
