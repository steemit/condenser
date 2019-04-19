import React, { Component } from 'react';
import { connect } from 'react-redux';

class GptAd extends Component {
    componentDidMount() {
        if (!this.ad) {
            return;
        }

        googletag.cmd.push(() => {
            const slot = googletag.defineSlot.apply(googletag, this.ad.args);
            slot.addService(googletag.pubads());

            googletag.cmd.push(() => {
                googletag.display(this.ad.slot_id);
                googletag.pubads().refresh([slot]);
                googletag
                    .pubads()
                    .addEventListener('slotRenderEnded', function(event) {
                        console.log('Slot has been rendered:', event);
                        window.dispatchEvent(new Event('gptadshown'));
                    });
            });
        });
    }

    render() {
        if (!this.ad) {
            return null;
        }

        return (
            <div
                className="gpt-ad"
                style={{ width: '100%' }}
                id={this.ad.slot_id}
            />
        );
    }

    get ad() {
        const { gptSlots, gptEnabled, slotName, postCategory } = this.props;
        const slots = gptSlots || {};
        const categoriesAds = slots.categories || {};
        const categoryAds = categoriesAds[postCategory] || {};
        const ad = categoryAds[slotName] || slots[slotName] || {};

        if (
            !gptEnabled ||
            !process.env.BROWSER ||
            !window.googletag ||
            !ad.slot_id ||
            !ad.args
        ) {
            return null;
        }

        return ad;
    }
}

export default connect((state, ownProps) => {
    const env = state.app.get('env');
    const gptEnabled = state.app.getIn(['googleAds', 'gptEnabled']);
    const gptSlots = state.app.getIn(['googleAds', 'gptSlots']).toJS();
    const postCategory = state.global.get('postCategory');
    return {
        env,
        gptEnabled,
        gptSlots,
        postCategory,
        ...ownProps,
    };
})(GptAd);
