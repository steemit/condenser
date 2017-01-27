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
    }

    Steemd(e) {
        serverApiRecordEvent('Steemdb view', this.to);
    }

    Steemdb(e) {
        serverApiRecordEvent('Steemdb view', this.to);
    }

    onCopy() {
        this.setState({copied: true});
    }

    render() {
        const link    = this.props.permlink;
        const steemd  = 'http://steemd.com' + link;
        const steemdb = 'http://steemdb.com' + link;
        const steemit = 'https://steemit.com' + link;
        let text = this.state.copied === true ? "copied" : "copy";
        return (
            <span>
                <h4>Share this post</h4>
                <hr></hr>
                    <input className="input-group-field share-box" type="text" placeholder={steemit}></input>
                    <CopyToClipboard text={steemit} onCopy={this.onCopy}>
                      <button className="button tiny copy">{text}</button>
                    </CopyToClipboard>
                <h5>Alternative Sources</h5>
                <Icon name="steemd" />
                    <a href={steemd} onClick={this.Steemd} target="_blank"> {steemd}</a>
                <br></br>
                <Icon name="steemdb" />
                    <a href={steemdb} onClick={this.Steemdb} target="_blank"> {steemdb}</a>
            </span>
        )
    }
}

export default connect(
)(ExplorePost)
