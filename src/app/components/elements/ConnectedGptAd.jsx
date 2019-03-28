import React, { Component } from 'react';
import { connect } from 'react-redux';
import GptAd from 'app/components/elements/GptAd';

class BasicGptAd extends Component {
    render() {
        const ad = this.categoryAd || this.biddingAd || this.basicAd || {};
        return ad.slot_id && ad.args ? (
            <GptAd slot={ad.slot_id} args={ad.args} kind={ad.kind} />
        ) : null;
    }

    get categoryAd() {
        const { gptCategorySlots, slotName, postCategory } = this.props;
        const slots = gptCategorySlots || {};
        const categoryAds = slots[postCategory] || {};
        return categoryAds[slotName];
    }

    get biddingAd() {
        const { gptBiddingSlots, slotName } = this.props;
        const biddingSlots = gptBiddingSlots || {};
        return biddingSlots[slotName];
    }

    get basicAd() {
        const { gptSlots, slotName } = this.props;
        const slots = gptSlots || {};
        return slots[slotName];
    }
}

const ConnectedGptAd = connect(
    (state, ownProps) => {
        const gptSlots = state.app.getIn(['googleAds', 'gptSlots']).toJS();
        const gptBiddingSlots = state.app
            .getIn(['googleAds', 'gptBiddingSlots'])
            .toJS();
        const gptCategorySlots = state.app
            .getIn(['googleAds', 'gptCategorySlots'])
            .toJS();
        const postCategory = state.global.get('postCategory');
        return {
            gptSlots,
            gptBiddingSlots,
            gptCategorySlots,
            postCategory,
            ...ownProps,
        };
    },
    dispatch => ({})
)(BasicGptAd);

export default ConnectedGptAd;
