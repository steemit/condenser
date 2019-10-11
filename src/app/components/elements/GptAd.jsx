import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

class GptAd extends Component {
    constructor(props) {
        super(props);
        const { ad_identifier, enabled, type, tags, bannedTags } = props;

        this.ad_identifier = '';
        this.type = type;
        this.enabled = false;
        this.tags = tags;
        this.bannedTags = bannedTags;

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
        this.unique_slot_id = `${this.ad_identifier}_${Date.now()}`;
    }

    componentDidMount() {
        if (!this.ad_identifier || !this.enabled) return;
        const ad_identifier = this.ad_identifier;
        const unique_slot_id = this.unique_slot_id;

        window.optimize.queue.push(() => {
            window.optimize.push(unique_slot_id);

            googletag.pubads().addEventListener('impressionViewable', e => {
                window.dispatchEvent(new Event('gptadshown', e));
            });

            googletag.pubads().addEventListener('slotRenderEnded', e => {
                window.dispatchEvent(new Event('gptadshown', e));
            });
        });
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
    tags: PropTypes.arrayOf(PropTypes.string),
    bannedTags: PropTypes.arrayOf(PropTypes.string),
};

GptAd.defaultProps = {
    type: 'Freestar',
    tags: [],
    bannedTags: [],
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
        const bannedTags = state.app.getIn(['googleAds', 'gptBannedTags']);
        const bannedTagsJS = bannedTags ? bannedTags.toJS() : [];

        let slotName = props.slotName;
        if (!slotName) {
            slotName = props.id;
        }
        const type = props.type;
        let slot = slotName; // in case it's Freestar
        if (type != 'Freestar') {
            slot = state.app.getIn(['googleAds', `gpt${type}Slots`, slotName]);
        }

        return {
            enabled,
            ad: slot, //TODO: Clean this up. This is from old GPT/Coinzilla stuffs
            ad_identifier: slotName,
            bannedTagsJS,
            ...props,
        };
    },
    dispatch => ({})
)(GptAd);
