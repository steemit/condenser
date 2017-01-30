import React, { PropTypes, Component } from 'react';
import {connect} from 'react-redux';
import {serverApiRecordEvent} from 'app/utils/ServerApiClient';
import Icon from 'app/components/elements/Icon';
import CopyToClipboard from 'react-copy-to-clipboard';

class ExplorePost extends Component {

    static propTypes = {
        permlink: PropTypes.string.isRequired
    };

    constructor(props) {
        super(props);
        this.state = {
            copied: false
        };
        this.onCopy = this.onCopy.bind(this);
    }

    Steemd(e) {
        serverApiRecordEvent('Steemdb view', this.to);
    }

    Steemdb(e) {
        serverApiRecordEvent('Steemdb view', this.to);
    }

    onCopy() {
        this.setState({
            copied: true
        });
    }

    render() {
        const link    = this.props.permlink;
        const steemd  = 'http://steemd.com' + link;
        const steemdb = 'http://steemdb.com' + link;
        const steemit = 'https://steemit.com' + link;
        let text = this.state.copied == true ? "copied!" : "copy";
        return (
            <span className="share-reveal">
                <h4>Share this post</h4>
                <hr></hr>
                    <CopyToClipboard text={steemit} onCopy={this.onCopy}>
                      <button className="button tiny copy">{text}</button>
                    </CopyToClipboard>
                    <input className="input-group-field share-box" type="text" placeholder={steemit}></input>
                <h5>Alternative Sources</h5>
                <a href={steemd} onClick={this.Steemd} target="_blank"> steemd.com</a><Icon name="extlink" />
                <br></br>
                <a href={steemdb} onClick={this.Steemdb} target="_blank"> steemdb.com</a><Icon name="extlink" />
            </span>
        )
    }
}

export default connect(
)(ExplorePost)
