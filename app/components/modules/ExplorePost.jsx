import React, {PropTypes, Component} from 'react';
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
    }

    render() {
        const APP_DOMAIN = $STM_Config.site_domain
        const link = this.props.permlink;
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
                            }
                        } 
                        className="ExplorePost__copy-button input-group-label"
                    >
                      <span>{this.state.copied_second ? tt('explorepost_jsx.copied') : tt('explorepost_jsx.copy')}</span>
                    </CopyToClipboard>
                </div>
                {/* <hr />
                <h5>{tt('explorepost_jsx.alternative_sources')}</h5>
                <ul>
                    <li><a href={} onClick={} target="_blank"><Icon name="extlink" /></a></li>
                </ul> */}
            </span>
        )
    }
}

