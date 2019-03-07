import React, { Component } from 'react';
import GptAd from 'app/components/elements/GptAd';

export class RenderAd extends Component {
    render() {
        const { gptSlots, slotName, postCategory } = this.props;
        const slots = gptSlots || {};
        const categoriesAds = slots.categories || {};
        const categoryAds = categoriesAds[postCategory] || {};
        const ad = categoryAds[slotName] || slots[slotName] || {};
        console.log('AdUtils renderAd ad', ad);
        const adSlot = ad['slot_id'];
        const adArgs = ad['args'];
        if (!adSlot || !adArgs) {
            console.log('AdUtils renderAd not rendered');
            return null;
        }

        console.log('AdUtils renderAd adSlot adArgs', adSlot, adArgs);
        return <GptAd slot={adSlot} args={adArgs} />;
    }
}
