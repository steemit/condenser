import React from 'react';
import { connect } from 'react-redux';

class GoogleAd extends React.Component {
    componentDidMount() {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
    }

    render() {
        if (!this.props.shouldSeeAds) {
            return null;
        }

        const style = Object.assign(
            {},
            {
                display: 'inline-block',
                width: '100%',
            },
            this.props.style || {}
        );

        const className = ['adsbygoogle']
            .concat(this.props.name ? [this.props.name] : [])
            .join(' ');

        return (
            <ins
                className={className}
                style={style}
                data-adtest={this.props.test}
                data-ad-client={this.props.client}
                data-ad-slot={this.props.slot}
                data-ad-format="auto"
            />
        );
    }
}

export default connect((state, ownProps) => {
    const shouldSeeAds = state.app.getIn(['googleAds', 'shouldSeeAds']);
    const test = state.app.getIn(['googleAds', 'test']);
    const client = state.app.getIn(['googleAds', 'client']);
    return { shouldSeeAds, test, client, ...ownProps };
})(GoogleAd);
