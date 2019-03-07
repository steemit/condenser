import React, { Component } from 'react';
import { connect } from 'react-redux';
import GptAd from 'app/components/elements/GptAd';

class BasicGptAd extends Component {
    render() {
        const { gptSlots, slotName, postCategory } = this.props;
        const slots = gptSlots || {};
        const categoriesAds = slots.categories || {};
        const categoryAds = categoriesAds[postCategory] || {};
        const ad = categoryAds[slotName] || slots[slotName] || {};
        const adSlot = ad['slot_id'];
        const adArgs = ad['args'];
        if (!adSlot || !adArgs) {
            console.log('ConnectedGptAd renderAd not rendered', this.props, ad);
            return null;
        }

        console.log('AdUtils renderAd adSlot adArgs', this.props, ad);
        return <GptAd slot={adSlot} args={adArgs} />;
    }
}

const ConnectedGptAd = connect(
    (state, ownProps) => {
        const gptSlots = state.app.getIn(['googleAds', 'gptSlots']).toJS();
        const postCategory = state.global.get('postCategory');
        return {
            gptSlots,
            postCategory,
            ...ownProps,
        };
    },
    dispatch => ({})
)(BasicGptAd);

export default ConnectedGptAd;
