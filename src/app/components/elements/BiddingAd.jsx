import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

class BiddingAd extends Component {
    componentDidMount() {
        if (!this.ad.path || !this.enabled) return;

        googletag.cmd.push(() => {
            const slot = googletag.defineSlot(
                this.ad.path,
                this.ad.dimensions,
                this.ad.path
            );

            if (slot) {
                slot.addService(googletag.pubads());
                googletag.pubads().enableSingleRequest();
                googletag.enableServices();

                googletag.cmd.push(() => {
                    googletag.display(this.ad.path);
                    this.refreshBid(this.ad.path, slot);

                    googletag
                        .pubads()
                        .addEventListener('impressionViewable', e => {
                            window.dispatchEvent(new Event('gptadshown', e));
                        });

                    googletag
                        .pubads()
                        .addEventListener('slotRenderEnded', e => {
                            window.dispatchEvent(new Event('gptadshown', e));
                        });
                });
            }
        });
    }

    refreshBid(path, slot) {
        pbjs.que.push(() => {
            pbjs.requestBids({
                timeout: 2000,
                adUnitCodes: [path],
                bidsBackHandler: function() {
                    pbjs.setTargetingForGPTAsync([path]);
                    googletag.pubads().refresh([slot]);
                },
            });
        });
    }

    constructor(props) {
        super(props);
        const { ad, enabled, type } = props;

        this.ad = {};
        this.type = type;
        this.enabled = false;

        if (ad) {
            // console.info(
            //     `Slot named '${props.slotName}' will render with given data:`,
            //     ad
            // );
            this.enabled = enabled;
            this.ad = ad.toJS();
        } else {
            // console.info(
            //     `Slot named '${
            //         props.slotName
            //     }' will be disabled because we were unable to find the ad details.`
            // );
        }
    }

    render() {
        return (
            <div
                className="bidding-ad gpt-ad"
                style={{ width: '100%' }}
                id={this.ad.path}
            />
        );
    }
}

BiddingAd.propTypes = {
    ad: PropTypes.shape({
        path: PropTypes.string,
        dimensions: PropTypes.array,
    }).isRequired,
    enabled: PropTypes.bool.isRequired,
    type: PropTypes.oneOf(['Bidding', 'Category', 'Basic']),
};

export default connect(
    (state, props) => {
        const enabled =
            !!state.app.getIn(['googleAds', 'gptEnabled']) &&
            !!process.env.BROWSER &&
            !!window.googletag;
        const postCategory = state.global.get('postCategory');
        const basicSlots = state.app.getIn(['googleAds', `gptBasicSlots`]);
        const biddingSlots = state.app.getIn(['googleAds', `gptBiddingSlots`]);
        const categorySlots = state.app.getIn([
            'googleAds',
            `gptCategorySlots`,
        ]);

        const slotName = props.slotName;
        let type = props.type;
        let slot = state.app.getIn(['googleAds', `gpt${type}Slots`, slotName]);

        return {
            enabled,
            ad: slot,
            ...props,
        };
    },
    dispatch => ({})
)(BiddingAd);
