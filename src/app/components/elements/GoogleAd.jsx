import React from 'react';

export class GoogleAd extends React.Component {
    componentDidMount() {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
    }

    render() {
        if (typeof window === 'undefined') {
            return null;
        }
        if (!window.googleAds) {
            return null;
        }

        return (
            <ins
                className="adsbygoogle"
                style={{ display: 'block', width: '100%' }}
                data-ad-test={window.googleAds.test}
                data-ad-client={window.googleAds.client}
                data-ad-slot={this.props.slot}
                data-ad-format="auto"
            />
        );
    }
}
