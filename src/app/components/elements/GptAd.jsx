import React from 'react';
import { connect } from 'react-redux';

class GptAd extends React.Component {
    componentDidMount() {
        if (!this.props.gptEnabled) {
            return;
        }

        googletag.cmd.push(() => {
            googletag.display(this.props.slot);
        });
    }

    render() {
        console.log('props', this.props);
        if (!this.props.gptEnabled) {
            return null;
        }

        return <div id={this.props.slot} />;
    }
}

export default connect((state, ownProps) => {
    const env = state.app.get('env');
    const gptEnabled = state.app.getIn(['googleAds', 'gptEnabled']);
    return { env, gptEnabled, ...ownProps };
})(GptAd);
