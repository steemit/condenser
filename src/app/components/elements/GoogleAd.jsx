import React from 'react';

export default class AdComponent extends React.Component {
    componentDidMount() {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
    }

    render() {
        if (!window.googleAds) {
            return null;
        }

        return (
            <ins
                className="adsbygoogle"
                style={{ display: 'block' }}
                data-ad-client={window.googleAds.google_ad_client}
                data-ad-test={window.googleAds.google_ad_test}
                data-ad-slot={this.props.slot}
                data-ad-format="auto"
            />
        );
    }
}
