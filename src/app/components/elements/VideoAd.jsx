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
    }

    componentDidMount() {
        if (!this.ad_identifier || !this.enabled) return;
        const ad_identifier = this.ad_identifier;
    }

    render() {
        if (!this.ad_identifier || !this.enabled) {
            return <div id="disabled_video_ad" style={{ display: 'none' }} />;
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

        return {
            enabled,
            ad_identifier: props.id,
            ...props,
        };
    },
    dispatch => ({})
)(VideoAd); 