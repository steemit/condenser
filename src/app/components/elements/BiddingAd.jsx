import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

class BiddingAd extends Component {
    componentDidMount() {
        window.addEventListener('prebidNoBids', this.prebidNoBids);
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
                    //   googletag.pubads().refresh([slot]);
                    //   googletag
                    //     .pubads()
                    //     .addEventListener('slotRenderEnded', event => {
                    //       console.info('BiddingAd - Slot has been rendered:', event);
                    //       window.dispatchEvent(new Event('biddingadshown'));
                    //     });
                });
            }
        });

        //
        // googletag.cmd.push(() => {
        //     googletag.display(this.ad.path);
        // });
    }

    refreshBid(path, slot) {
        pbjs.que.push(() => {
            pbjs.requestBids({
                timeout: PREBID_TIMEOUT,
                adUnitCodes: [path],
                bidsBackHandler: function() {
                    console.log('biddingad-refreshbid-', arguments);
                    pbjs.setTargetingForGPTAsync([path]);
                    googletag.pubads().refresh([slot]);
                },
            });
        });
    }

    componentWillUnmount() {
        window.removeEventListener('prebidNoBids', this.prebidNoBids);
    }

    prebidNoBids(e) {
        console.log('BiddingAd - Received a NOBIDS event', e, this.state);
        if (e.slotId === this.ad.path) {
            console.log(
                'BiddingAd - Will hide this ad based on event match id',
                e
            );
            // this.setState({ shown: false });
        }
    }

    constructor(props) {
        super(props);
        const { ad, enabled, type } = props;

        this.ad = {};
        this.type = type;
        this.enabled = false;

        if (ad) {
            console.info(
                `Slot named '${props.slotName}' will render with given data:`,
                ad
            );
            this.enabled = enabled;
            this.ad = ad.toJS();
        } else {
            console.info(
                `Slot named '${
                    props.slotName
                }' will be disabled because we were unable to find the ad details.`
            );
        }
        this.state = { shown: true };

        this.prebidNoBids = this.prebidNoBids.bind(this);
    }

    render() {
        // if (this.state.shown) {
        return (
            <div
                className="bidding-ad gpt-ad"
                style={{ width: '100%' }}
                id={this.ad.path}
            />
        );
        // } else {
        // TODO: One Day we will fall back to another ad type here.
        // console.log('BiddingAd->render() - NOT SHOWING AN AD')
        // return null;
        // }
    }
}

// BiddingAd.propTypes = {
//     id: PropTypes.string.isRequired, // TODO: This is the naive way, make this better with a sensible config.
//     type: PropTypes.oneOf(['Bidding', 'Category', 'Basic']),
// };
//
// export default connect(
//     (state, props) => {
//         // console.log('GptBidding::connect', props);
//
//         return {
//             ...props,
//         };
//     },
//     dispatch => ({})
// )(BiddingAd);

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
        console.log('Found slot for type', type, slot);

        return {
            enabled,
            ad: slot,
            ...props,
        };
    },
    dispatch => ({})
)(BiddingAd);
