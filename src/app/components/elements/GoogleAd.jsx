import React from 'react';
import { connect } from 'react-redux';

class GoogleAd extends React.Component {
    componentDidMount() {
        if (!this.props.shouldSeeAds) {
            return;
        }

        (window.adsbygoogle = window.adsbygoogle || []).push({});
    }

    render() {
        if (!this.props.shouldSeeAds) {
            return null;
        }

        const style = Object.assign(
            {
                display: 'inline-block',
                width: '100%',
            },
            this.props.style || {}
        );

        const className = ['adsbygoogle']
            .concat(this.props.env === 'development' ? ['ad-dev'] : [])
            .concat(this.props.name ? [this.props.name] : [])
            .join(' ');

        return (
            <ins
                className={className}
                style={style}
                data-adtest={this.props.test}
                data-ad-client={this.props.client}
                data-ad-slot={this.props.slot}
                data-ad-format={this.props.format || 'auto'}
                data-ad-layout-key={this.props.layoutKey}
                data-full-width-responsive={this.props.fullWidthResponsive}
            />
        );
    }
}

export default connect((state, ownProps) => {
    const env = state.app.get('env');
    const shouldSeeAds = state.app.getIn(['googleAds', 'enabled']);
    const test = state.app.getIn(['googleAds', 'test']);
    const client = state.app.getIn(['googleAds', 'client']);
    return { env, shouldSeeAds, test, client, ...ownProps };
})(GoogleAd);
