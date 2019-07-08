import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

class GptAd extends Component {
    componentDidMount() {
        if (!this.ad_identifier || !this.enabled) return;
        const ad_identifier = this.ad_identifier;
        const unique_slot_id = this.unique_slot_id;

        freestar.newAdSlots([
            {
                placementName: ad_identifier, // This has to match up with the backend and frontend and all the other ends.
                slotId: unique_slot_id, // This has to be unique per page and must match the id of the ad element.
            },
        ]);

        freestar.queue.push(e => {
            googletag.pubads().addEventListener('impressionViewable', e => {
                window.dispatchEvent(new Event('gptadshown', e));
            });

            googletag.pubads().addEventListener('slotRenderEnded', e => {
                window.dispatchEvent(new Event('gptadshown', e));
            });
        });
    }

    constructor(props) {
        super(props);
        const { ad_identifier, enabled, type } = props;

        this.ad_identifier = '';
        this.type = type;
        this.enabled = false;

        if (ad_identifier != '') {
            // console.info(
            //     `ad_identifier of '${ad_identifier}' will render.`,
            //     ad_identifier
            // );
            this.enabled = enabled;
            this.ad_identifier = ad_identifier;
        } else {
            // console.info(
            //     `Slot named '${
            //         props.slotName
            //     }' will be disabled because we were unable to find the ad details.`
            // );
        }
        this.unique_slot_id = `${this.ad_identifier}-${Date.now()}`;
    }

    render() {
        if (!this.ad_identifier || !this.enabled) {
            return <div id="disabled_ad" style={{ display: 'none' }} />;
        }

        return (
            <div
                className="gpt-ad"
                style={{ width: '100%' }}
                id={this.unique_slot_id}
            />
        );
    }
}

GptAd.propTypes = {
    ad_identifier: PropTypes.string.isRequired,
    enabled: PropTypes.bool.isRequired,
    type: PropTypes.oneOf(['Bidding', 'Category', 'Basic', 'Freestar']),
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

        let slotName = props.slotName;
        if (!slotName) {
            slotName = props.id;
        }
        let type = props.type;
        let slot = slotName; // in case it's Freestar
        if (type != 'Freestar') {
            slot = state.app.getIn(['googleAds', `gpt${type}Slots`, slotName]);
        }

        return {
            enabled,
            ad: slot,
            ad_identifier: slotName,
            ...props,
        };
    },
    dispatch => ({})
)(GptAd);
