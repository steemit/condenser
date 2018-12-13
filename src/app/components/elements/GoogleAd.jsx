import React from 'react';
import { connect } from 'react-redux';

class GoogleAd extends React.Component {
    componentDidMount() {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
    }

    render() {
        if (typeof window === 'undefined') {
            return null;
        }
        if (!this.props.shouldSeeAds) {
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

export default connect((state, ownProps) => {
    const shouldSeeAds = state.app.getIn(['googleAds', 'shouldSeeAds']);
    return { shouldSeeAds, ...ownProps };
})(GoogleAd);
