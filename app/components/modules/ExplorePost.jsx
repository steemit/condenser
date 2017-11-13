import React, {PropTypes, Component} from 'react';
import {serverApiRecordEvent} from 'app/utils/ServerApiClient';
import Icon from 'app/components/elements/Icon';
import CopyToClipboard from 'react-copy-to-clipboard';
import tt from 'counterpart';

export default class ExplorePost extends Component {

    static propTypes = {
        permlink: PropTypes.string.isRequired
    };

    constructor(props) {
        super(props);
        this.state = {
            copied_first: false,
            copied_second: false,
        };

        this.Golosd = this.Golosd.bind(this);
        this.Golosdb = this.Golosdb.bind(this);
    }

    Golosd() {
        serverApiRecordEvent('GolosdView', this.props.permlink);
    }

    Golosdb() {
        serverApiRecordEvent('GolosdbView', this.props.permlink);
    }

    render() {
        const APP_DOMAIN = $STM_Config.site_domain
        const link = this.props.permlink;
        const golosd = 'http://golosd.com' + link;
        const golosdb = 'https://golosdb.com' + link;
        const golosio = `https://${APP_DOMAIN}` + link;
        const golosioCE = `https://${APP_DOMAIN}` + link.replace(/@/g, '%40');

        return (
            <span className="ExplorePost">
                <h4>{tt('g.share_this_post')}</h4>
                <hr />
                <div className="input-group">
                    <input className="input-group-field share-box" type="text" value={golosio} onChange={(e) => e.preventDefault()} />
                    <CopyToClipboard 
                        text={golosio} 
                        onCopy={() => {
                                this.setState({copied_first: true});
                                serverApiRecordEvent('ExplorePost', this.props.permlink);
                            }
                        } 
                        className="ExplorePost__copy-button input-group-label"
                    >
                      <span>{this.state.copied_first ? tt('explorepost_jsx.copied') : tt('explorepost_jsx.copy')}</span>
                    </CopyToClipboard>
                </div>
                <div className="input-group">
                    <input className="input-group-field share-box" type="text" value={golosioCE} onChange={(e) => e.preventDefault()} />
                    <CopyToClipboard 
                        text={golosioCE} 
                        onCopy={() => {
                                this.setState({copied_second: true});
                                serverApiRecordEvent('ExplorePost', this.props.permlink);
                            }
                        } 
                        className="ExplorePost__copy-button input-group-label"
                    >
                      <span>{this.state.copied_second ? tt('explorepost_jsx.copied') : tt('explorepost_jsx.copy')}</span>
                    </CopyToClipboard>
                </div>
                <hr />
                <h5>{tt('explorepost_jsx.alternative_sources')}</h5>
                <ul>
                    <li><a href={golosd} onClick={this.Golosd} target="_blank">golosd.com <Icon name="extlink" /></a></li>
                    <li><a href={golosdb} onClick={this.Golosdb} target="_blank">golosdb.com <Icon name="extlink" /></a></li>
                </ul>
            </span>
        )
    }
}

