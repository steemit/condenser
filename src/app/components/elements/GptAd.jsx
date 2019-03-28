import React from 'react';
import { connect } from 'react-redux';

class GptAd extends React.Component {
    componentDidMount() {
        if (
            !this.props.gptEnabled ||
            !process.env.BROWSER ||
            !window.googletag
        ) {
            return null;
        }

        googletag.cmd.push(() => {
            const slot = googletag.defineSlot.apply(googletag, this.props.args);
            slot.addService(googletag.pubads());

            googletag.cmd.push(() => {
                googletag.display(this.props.slot);
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
        if (
            !this.props.gptEnabled ||
            !process.env.BROWSER ||
            !window.googletag
        ) {
            return null;
        }

        return (
            <div
                className={`gpt-ad kind-${this.props.kind}`}
                style={{ width: '100%' }}
                id={this.props.slot}
            />
        );
    }
}

export default connect((state, ownProps) => {
    const env = state.app.get('env');
    const gptEnabled = state.app.getIn(['googleAds', 'gptEnabled']);
    return { env, gptEnabled, ...ownProps };
})(GptAd);
