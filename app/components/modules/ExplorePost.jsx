import React, {PropTypes, Component} from 'react';
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
        this.Steemd = this.Steemd.bind(this);
        this.Steemdb = this.Steemdb.bind(this);
    }

    Steemd(e) {
        serverApiRecordEvent('Steemdb view', this.props.permlink);
    }

    Steemdb(e) {
        serverApiRecordEvent('Steemdb view', this.props.permlink);
    }

    onCopy() {
        this.setState({
            copied: true
        });
    }

    render() {
        const link = this.props.permlink;
        const steemd = 'https://steemd.com' + link;
        const steemdb = 'https://steemdb.com' + link;
        const steemit = 'https://steemit.com' + link;
        let text = this.state.copied == true ? 'Copied!' : 'COPY';
        return (
            <span className="ExplorePost">
                <h4>Share this post</h4>
                <hr />
                <div className="input-group">
                    <input className="input-group-field share-box" type="text" value={steemit} onChange={(e) => e.preventDefault()} />
                    <CopyToClipboard text={steemit} onCopy={this.onCopy} className="ExplorePost__copy-button input-group-label">
                      <span>{text}</span>
                    </CopyToClipboard>
                </div>
                <h5>Alternative Sources</h5>
                <ul>
                    <li><a href={steemd} onClick={this.Steemd} target="_blank">steemd.com <Icon name="extlink" /></a></li>
                    <li><a href={steemdb} onClick={this.Steemdb} target="_blank">steemdb.com <Icon name="extlink" /></a></li>
                </ul>
            </span>
        )
    }
}

export default connect(
)(ExplorePost)
