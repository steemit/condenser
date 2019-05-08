import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

class BiddingAd extends Component {
    componentDidMount() {
        window.addEventListener('prebidNoBids', this.prebidNoBids);
        const id = this.id;
        googletag.cmd.push(function() {
            console.log(
                'BiddingAd::componentDidMount::2nd googletag push with display'
            );
            googletag.display(id);
        });
    }

    componentWillUnmount() {
        window.removeEventListener('prebidNoBids', this.prebidNoBids);
    }

    prebidNoBids(e) {
        console.log('Received a NOBIDS event', e, this.state);
        if (e.slotId === this.id) {
            console.log('Will hide this ad based on event match id', e);
            this.setState({ shown: false });
        }
    }

    constructor(props) {
        super(props);
        this.id = this.props.id;
        this.state = { shown: true };

        this.prebidNoBids = this.prebidNoBids.bind(this);
    }

    render() {
        console.log('BiddingAd::render');
        if (this.state.shown) {
            console.log('WILL SHOW A BIDDING AD!!!!!!!!!!!!!!!!!');
            return (
                <div className="bidding-ad gpt-ad" style={{ width: '100%' }}>
                    <div id={this.id} />
                </div>
            );
        } else {
            console.log('NO AD TO SHOW!');
            return null;
        }
    }
}

BiddingAd.propTypes = {
    id: PropTypes.string.isRequired, // TODO: This is the naive way, make this better with a sensible config.
    type: PropTypes.oneOf(['Bidding', 'Category', 'Basic']),
};

export default connect(
    (state, props) => {
        console.log('GptBidding::connect', props);

        return {
            ...props,
        };
    },
    dispatch => ({})
)(BiddingAd);
