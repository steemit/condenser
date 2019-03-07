import GptAd from 'app/components/elements/GptAd';

export function renderAd({ gptSlots, slotName, postCategory }) {
    const slots = gptSlots || {};
    const categoriesAds = slots.categories || {};
    const categoryAds = categoriesAds[postCategory] || {};
    const ad = categoryAds[slotName] || slots[slotName] || {};
    const adSlot = ad['slot_id'];
    const adArgs = ad['args'];
    if (!adSlot || !adArgs) {
        return null;
    }

    console.log('RENDER AD', adSlot, adArgs);
    return <GptAd slot={adSlot} args={adArgs} />;
}
