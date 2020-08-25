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
        const { width, height, adList, timer } = this.props;
        let reactSwipeEl;
        const swipeOpt = {
            speed: 1000,
            auto: timer,
        };
        return (
            <div className="ad-carousel">
                <ReactSwipe
                    swipeOptions={swipeOpt}
                    childCount={adList.size}
                    ref={el => (reactSwipeEl = el)}
                >
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
                                        style={{
                                            height: `${height}px`,
                                            width: `${width}px`,
                                        }}
                                    >
                                        <img
                                            key={inx}
                                            src={ad.get('img')}
                                            width={`${width}px`}
                                            height={`${height}px`}
                                            onClick={() =>
                                                this.goTo(
                                                    ad.get('url'),
                                                    ad.get('tag')
                                                )
                                            }
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
    timer: PropTypes.number,
};

export default connect(
    (state, props) => {
        return {};
    },
    dispatch => ({})
)(AdSwipe);
