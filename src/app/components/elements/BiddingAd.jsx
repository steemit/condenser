import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

// const BiddingConfig = {
//     slots: [
//         {
//             id: 'div-gpt-ad-1551233873698-0',
//             path:
//                 '/21784675435/steemit_bottom-of-post/steemit_bottom-of-post_prebid',
//             sizes: [[728, 90]],
//             prebid: [
//                 {
//                     mediaTypes: {
//                         banner: {
//                             sizes: [[728, 90]],
//                         },
//                     },
//                     bids: [
//                         {
//                             bidder: 'coinzilla',
//                             params: {
//                                 placementId: '6425c7b9886e0045972',
//                             },
//                         },
//                     ],
//                 },
//             ],
//         },
//         {
//             id: 'div-gpt-ad-1554687231046-0',
//             path:
//                 '/21784675435/steemit_left-navigation/steemit_left-navigation_prebid',
//             sizes: [[728, 90], [970, 90]],
//             prebid: [
//                 {
//                     mediaTypes: {
//                         banner: {
//                             sizes: [[728, 90], [970, 90]],
//                         },
//                     },
//                     bids: [
//                         {
//                             bidder: 'coinzilla',
//                             params: {
//                                 placementId: '3575c7b9886e2cb3619',
//                             },
//                         },
//                     ],
//                 },
//             ],
//         },
//     ],
// };

class BiddingAd extends Component {
    componentDidMount() {
        // console.log("BiddingAd::componentDidMount")
        // googletag.cmd.push(function() {
        //   console.log("BiddingAd::componentDidMount::googletag.cmd.push")
        //   // googletag
        //   //   .defineSlot(
        //   //     "/21784675435/steemit_bottom-of-post/steemit_bottom-of-post_prebid",
        //   //     [[728, 90]],
        //   //     "div-gpt-ad-1551233873698-0"
        //   //   )
        //   //   .addService(googletag.pubads());
        //   googletag
        //     .defineSlot(
        //       "/21784675435/steemit_left-navigation/steemit_left-navigation_prebid",
        //       [[120, 600], [160, 600]],
        //       "div-gpt-ad-1554687231046-0"
        //     )
        //     .addService(googletag.pubads());
        //   googletag.pubads().enableSingleRequest();
        //   googletag.enableServices();
        // });
        // This was the odl coe
        const id = this.id;
        googletag.cmd.push(function() {
            console.log(
                'BiddingAd::componentDidMount::2nd googletag push with display'
            );
            googletag.display(id);
        });

        // end old code
        // if (!this.ad.slot_id || !this.enabled) {
        //     return;
        // }
        //
        // googletag.cmd.push(() => {
        //     const slot = googletag.defineSlot(...this.ad.args);
        //
        //     if (slot) {
        //         slot.addService(googletag.pubads());
        //
        //         googletag.cmd.push(() => {
        //             googletag.display(this.ad.slot_id);
        //             googletag.pubads().refresh([slot]);
        //             googletag
        //                 .pubads()
        //                 .addEventListener('slotRenderEnded', event => {
        //                     console.info('Slot has been rendered:', event);
        //                     window.dispatchEvent(new Event('gptadshown'));
        //                 });
        //         });
        //     }
        // });
    }

    constructor(props) {
        super(props);
        this.id = 'div-gpt-ad-1554687231046-0';
        // const { ad, enabled, type } = props;
        //
        // this.ad = {};
        // this.type = type;
        // this.enabled = false;
        //
        // if (ad) {
        //     console.info(
        //         `Slot named '${props.slotName}' will render with given data:`,
        //         ad
        //     );
        //     this.enabled = enabled;
        //     this.ad = ad.toJS();
        // } else {
        //     console.info(
        //         `Slot named '${
        //             props.slotName
        //         }' will be disabled because we were unable to find the ad details.`
        //     );
        // }
    }

    render() {
        console.log('BiddingAd::render');

        return (
            <div className="bidding-ad gpt-ad" style={{ width: '100%' }}>
                <div id={this.id} />
                {/*
              <br />
              <p>Ad 728x90 for right side</p>
              <br />
              <div id="div-gpt-ad-1551233873698-0" style="height:90px; width:728px;">
                <script>
                  googletag.cmd.push(function() {
                    googletag.display("div-gpt-ad-1551233873698-0");
                    console.log('inside display ad->div-gpt-ad-1551233873698-0')
                  });
                </script>
              </div>
              */}
            </div>
        );
    }
}

// BiddingAd.propTypes = {
//     ad: PropTypes.object.isRequired, //TODO: Define this shape
//     enabled: PropTypes.bool.isRequired,
//     type: PropTypes.oneOf(['Bidding', 'Category', 'Basic']),
// };

export default connect(
    (state, props) => {
        console.log('GptBidding::connect', props);
        // const enabled =
        //     !!state.app.getIn(['googleAds', 'gptEnabled']) &&
        //     !!process.env.BROWSER &&
        //     !!window.googletag;
        // const postCategory = state.global.get('postCategory');
        // const basicSlots = state.app.getIn(['googleAds', `gptBasicSlots`]);
        // const biddingSlots = state.app.getIn(['googleAds', `gptBiddingSlots`]);
        // const categorySlots = state.app.getIn([
        //     'googleAds',
        //     `gptCategorySlots`,
        // ]);
        //
        // // Determine which type of ad to show
        // //
        // //   * Show a bidding ad if it's a bidding ad (e.g. Coinzilla)
        // //   * Show a category ad (an ad on just #cryptocurrency, for example)
        // //   * Fall back to a regular GPT ad
        // //
        // const slotName = props.slotName;
        //
        // let type = props.type;
        //
        // // let slot = basicSlots.getIn([slotName]);
        // let slot = state.app.getIn(['googleAds', `gpt${type}Slots`, slotName]);
        // console.log('GOT TYPE OF', type, slot);
        // // if (categorySlots.getIn([postCategory, slotName])) {
        // //     console.info(
        // //         `GPT-[${slotName}]::Overriding type of '${
        // //             type
        // //         }' to be 'category' due to category being set to '${
        // //             postCategory
        // //         }' and the existence of a category named '${
        // //             postCategory
        // //         }' which has a slot named '${slotName}'`
        // //     );
        // //     type = 'category';
        // //     slot = categorySlots.getIn([postCategory, slotName]);
        // // } else if (biddingSlots.getIn([slotName])) {
        // //     console.info(
        // //         `GPT-[${slotName}]::Overriding type of '${
        // //             type
        // //         }' to be 'bidding' because we have a bidding slot defined for slotName '${
        // //             slotName
        // //         }'`
        // //     );
        // //     type = 'bidding';
        // //     slot = biddingSlots.getIn([slotName]);
        // // } else {
        // //     console.info(
        // //         `GPT-[${slotName}]::No override for type. Sticking with '${
        // //             type
        // //         }'`
        // //     );
        // // }

        return {
            // enabled,
            // ad: slot,
            ...props,
        };
    },
    dispatch => ({})
)(BiddingAd);
