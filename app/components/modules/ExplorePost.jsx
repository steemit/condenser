import React, {PropTypes, Component} from 'react';
import {connect} from 'react-redux';
import {serverApiRecordEvent} from 'app/utils/ServerApiClient';
import Icon from 'app/components/elements/Icon';
import CopyToClipboard from 'react-copy-to-clipboard';
import tt from 'counterpart';

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
        this.Golosd = this.Golosd.bind(this);
        this.Golosdb = this.Golosdb.bind(this);
        this.Busy = this.Busy.bind(this);
    }

    Golosd() {
        serverApiRecordEvent('GolosdView', this.props.permlink);
    }

    Golosdb() {
        serverApiRecordEvent('GolosdbView', this.props.permlink);
    }

    Busy() {
        serverApiRecordEvent('Busy view', this.props.permlink);
    }

    onCopy() {
        this.setState({
            copied: true
        });
    }

    render() {
        const link = this.props.permlink;
        const golosd = 'http://golosd.com' + link;
        const golosdb = 'https://golosdb.com' + link;
        const busy = 'https://busy.org' + link;
        const golosio = 'https://golos.io' + link;
        let text = this.state.copied == true ? tt('explorepost_jsx.copied') : tt('explorepost_jsx.copy');
        return (
            <span className="ExplorePost">
                <h4>{tt('g.share_this_post')}</h4>
                <hr />
                <div className="input-group">
                    <input className="input-group-field share-box" type="text" value={golosio} onChange={(e) => e.preventDefault()} />
                    <CopyToClipboard text={golosio} onCopy={this.onCopy} className="ExplorePost__copy-button input-group-label">
                      <span>{text}</span>
                    </CopyToClipboard>
                </div>
                <h5>{tt('explorepost_jsx.alternative_sources')}</h5>
                <ul>
                    <li><a href={golosd} onClick={this.Golosd} target="_blank">golosd.com <Icon name="extlink" /></a></li>
                    <li><a href={golosdb} onClick={this.Golosdb} target="_blank">golosdb.com <Icon name="extlink" /></a></li>
                </ul>
            </span>
        )
    }
}

export default connect(
)(ExplorePost)
