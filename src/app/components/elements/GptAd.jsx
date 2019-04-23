import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

class GptAd extends Component {
    componentDidMount() {
        if (!this.ad.slot_id || !this.enabled) {
            return;
        }

        googletag.cmd.push(() => {
            const slot = googletag.defineSlot(...this.ad.args);

            if (slot) {
                slot.addService(googletag.pubads());

                googletag.cmd.push(() => {
                    googletag.display(this.ad.slot_id);
                    googletag.pubads().refresh([slot]);
                    googletag
                        .pubads()
                        .addEventListener('slotRenderEnded', event => {
                            console.info('Slot has been rendered:', event);
                            window.dispatchEvent(new Event('gptadshown'));
                        });
                });
            }
        });
    }

    constructor(props) {
        super(props);
        const { ad, enabled } = props;

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
            this.enabled = false;
            this.ad = {};
        }
    }

    render() {
        if (!this.ad || !this.enabled) {
            return <div id="disabled_ad" style={{ display: 'none' }} />;
        }

        return (
            <div
                className="gpt-ad"
                style={{ width: '100%' }}
                id={this.ad.slot_id}
            />
        );
    }
}

GptAd.propTypes = {
    ad: PropTypes.object.isRequired, //TODO: Define this shape
    enabled: PropTypes.bool.isRequired,
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

        // Determine which type of ad to show
        //
        //   * Show a bidding ad if it's a bidding ad (e.g. Coinzilla)
        //   * Show a category ad (an ad on just #cryptocurrency, for example)
        //   * Fall back to a regular GPT ad
        //
        const slotName = props.slotName;

        let type = 'basic';
        let slot = basicSlots.getIn([slotName]);
        if (categorySlots.getIn([postCategory, slotName])) {
            console.info(
                `GPT-[${slotName}]::Overriding type of '${
                    type
                }' to be 'category' due to category being set to '${
                    postCategory
                }' and the existence of a category named '${
                    postCategory
                }' which has a slot named '${slotName}'`
            );
            type = 'category';
            slot = categorySlots.getIn([postCategory, slotName]);
        } else if (biddingSlots.getIn([slotName])) {
            console.info(
                `GPT-[${slotName}]::Overriding type of '${
                    type
                }' to be 'bidding' because we have a bidding slot defined for slotName '${
                    slotName
                }'`
            );
            type = 'bidding';
            slot = biddingSlots.getIn([slotName]);
        } else {
            console.info(
                `GPT-[${slotName}]::No override for type. Sticking with '${
                    type
                }'`
            );
        }

        return {
            enabled,
            ad: slot,
            ...props,
        };
    },
    dispatch => ({})
)(GptAd);
