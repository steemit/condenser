import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

class VideoAd extends Component {
    constructor(props) {
        super(props);
        const { ad_identifier, enabled } = props;

        this.ad_identifier = '';
        this.enabled = false;

        if (ad_identifier != '') {
            this.enabled = enabled;
            this.ad_identifier = ad_identifier;
        }
        // not used yet, need more info from steemrail about using multiple ads
        this.unique_slot_id = `${this.ad_identifier}_${Date.now()}`;
    }

    componentDidMount() {
        if (!this.ad_identifier || !this.enabled) return;
        const ad_identifier = this.ad_identifier;
        const unique_slot_id = this.unique_slot_id;

        // add logic here for refreshing adds (if available)
        // leaving how we do it with BSA for example
        /*
        window.optimize.queue.push(() => {
            window.optimize.push(unique_slot_id);

            googletag.pubads().addEventListener('impressionViewable', e => {
                window.dispatchEvent(new Event('gptadshown', e));
            });

            googletag.pubads().addEventListener('slotRenderEnded', e => {
                window.dispatchEvent(new Event('gptadshown', e));
            });
        });*/
    }

    render() {
        if (!this.ad_identifier || !this.enabled) {
            return <div id="disabled_ad" style={{ display: 'none' }} />;
        }

        return (
            <div
                className="video-ad"
                id={this.ad_identifier}
            />
        );
    }
}

VideoAd.propTypes = {
    ad_identifier: PropTypes.string.isRequired,
    enabled: PropTypes.bool.isRequired,
};

VideoAd.defaultProps = {};

export default connect(
    (state, props) => {
        const enabled =
            !!state.app.getIn(['googleAds', 'videoAdsEnabled']) &&
            !!process.env.BROWSER;

        let slotName = props.slotName;
        if (!slotName) {
            slotName = props.id;
        }

        return {
            enabled,
            ad_identifier: slotName,
            ...props,
        };
    },
    dispatch => ({})
)(VideoAd);