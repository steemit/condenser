import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { serverApiRecordEvent } from 'app/utils/ServerApiClient';
import Icon from 'app/components/elements/Icon';
import CopyToClipboard from 'react-copy-to-clipboard';
import tt from 'counterpart';

class ExplorePost extends Component {
    static propTypes = {
        permlink: PropTypes.string.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            copied: false,
        };
        this.onCopy = this.onCopy.bind(this);
        this.Steemd = this.Steemd.bind(this);
        this.Steemdb = this.Steemdb.bind(this);
        this.Busy = this.Busy.bind(this);
    }

    Steemd() {
        serverApiRecordEvent('SteemdView', this.props.permlink);
    }

    Steemdb() {
        serverApiRecordEvent('SteemdbView', this.props.permlink);
    }

    Busy() {
        serverApiRecordEvent('Busy view', this.props.permlink);
    }

    onCopy() {
        this.setState({
            copied: true,
        });
    }

    render() {
        const link = this.props.permlink;
        const steemd = 'https://steemd.com' + link;
        const steemdb = 'https://steemdb.com' + link;
        const busy = 'https://busy.org' + link;
        const steemit = 'https://steemit.com' + link;
        let text =
            this.state.copied == true
                ? tt('explorepost_jsx.copied')
                : tt('explorepost_jsx.copy');
        return (
            <span className="ExplorePost">
                <h4>{tt('g.share_this_post')}</h4>
                <hr />
                <div className="input-group">
                    <input
                        className="input-group-field share-box"
                        type="text"
                        value={steemit}
                        onChange={e => e.preventDefault()}
                    />
                    <CopyToClipboard
                        text={steemit}
                        onCopy={this.onCopy}
                        className="ExplorePost__copy-button input-group-label"
                    >
                        <span>{text}</span>
                    </CopyToClipboard>
                </div>
                <h5>{tt('explorepost_jsx.alternative_sources')}</h5>
                <ul>
                    <li>
                        <a
                            href={steemd}
                            onClick={this.Steemd}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            steemd.com <Icon name="extlink" />
                        </a>
                    </li>
                    <li>
                        <a
                            href={steemdb}
                            onClick={this.Steemdb}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            steemdb.com <Icon name="extlink" />
                        </a>
                    </li>
                    <li>
                        <a
                            href={busy}
                            onClick={this.Busy}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            busy.org <Icon name="extlink" />
                        </a>
                    </li>
                </ul>
            </span>
        );
    }
}

export default connect()(ExplorePost);
