import React from 'react';
import tt from 'counterpart';
import CloseButton from 'react-foundation-components/lib/global/close-button';
import { LIQUID_TOKEN } from 'app/client_config';
import Icon from 'app/components/elements/Icon';

export default class SidePanel extends React.Component {
    static propTypes = {
        children: React.PropTypes.array,
        alignment: React.PropTypes.string,
    };

    constructor(props) {
        super(props);
        this.state = { visible: false };
        this.hide = this.hide.bind(this);
    }

    componentWillUnmount() {
        document.removeEventListener('click', this.hide);
    }

    show = () => {
        this.setState({ visible: true });
        document.addEventListener('click', this.hide);
    };

    hide = () => {
        this.setState({ visible: false });
        document.removeEventListener('click', this.hide);
    };

    render() {
        const { visible } = this.state;
        const { children, alignment, navigate } = this.props;
        return (
            <div className="SidePanel">
                <div className={(visible ? 'visible ' : '') + alignment}>
                    <CloseButton onClick={this.hide} />
                    <ul className="vertical menu">
                        <li>
                            <a href="/welcome" onClick={this.navigate}>
                                {tt('navigation.welcome')}
                            </a>
                        </li>
                        <li>
                            <a href="/faq.html" onClick={this.navigate}>
                                {tt('navigation.faq')}
                            </a>
                        </li>
                        <li>
                            <a href="/tags" onClick={this.navigate}>
                                {tt('navigation.explore')}
                            </a>
                        </li>
                        <li>
                            <a href="/market" onClick={this.navigate}>
                                {tt('navigation.currency_market')}
                            </a>
                        </li>
                        <li>
                            <a
                                href="/recover_account_step_1"
                                onClick={this.navigate}
                            >
                                {tt('navigation.stolen_account_recovery')}
                            </a>
                        </li>
                        <li>
                            <a href="/change_password" onClick={this.navigate}>
                                {tt('navigation.change_account_password')}
                            </a>
                        </li>
                        <li className="last">
                            <a href="/~witnesses" onClick={this.navigate}>
                                {tt('navigation.vote_for_witnesses')}
                            </a>
                        </li>
                    </ul>
                    <ul className="vertical menu">
                        <li>
                            <a onClick={() => depositSteem(username)}>
                                {tt('navigation.buy_LIQUID_TOKEN', {
                                    LIQUID_TOKEN,
                                })}&nbsp;<Icon name="extlink" />
                            </a>
                        </li>
                        <li>
                            <a
                                href="https://thesteemitshop.com/"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {tt('navigation.shop')}&nbsp;<Icon name="extlink" />
                            </a>
                        </li>
                        <li>
                            <a
                                href="https://steemit.chat/home"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {tt('navigation.chat')}&nbsp;<Icon name="extlink" />
                            </a>
                        </li>
                        <li>
                            <a
                                href="http://steemtools.com/"
                                onClick={this.navigate}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {tt('navigation.app_center')}&nbsp;<Icon name="extlink" />
                            </a>
                        </li>
                        <li className="last">
                            <a
                                href="https://developers.steem.io/"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {tt('navigation.api_docs')}&nbsp;<Icon name="extlink" />
                            </a>
                        </li>
                    </ul>
                    <ul className="vertical menu">
                        <li>
                            <a
                                href="https://steem.io/steem-bluepaper.pdf"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {tt('navigation.bluepaper')}&nbsp;<Icon name="extlink" />
                            </a>
                        </li>
                        <li>
                            <a
                                href="https://smt.steem.io/"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {tt('navigation.smt_whitepaper')}&nbsp;<Icon name="extlink" />
                            </a>
                        </li>
                        <li>
                            <a
                                href="https://steem.io/SteemWhitePaper.pdf"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {tt('navigation.whitepaper')}&nbsp;<Icon name="extlink" />
                            </a>
                        </li>
                        <li>
                            <a href="https://steem.io" onClick={this.navigate}>
                                {tt('navigation.about')}&nbsp;<Icon name="extlink" />
                            </a>
                        </li>
                        <li>
                            <a
                                href="/privacy.html"
                                onClick={this.navigate}
                                rel="nofollow"
                            >
                                {tt('navigation.privacy_policy')}
                            </a>
                        </li>
                        <li className="last">
                            <a
                                href="/tos.html"
                                onClick={this.navigate}
                                rel="nofollow"
                            >
                                {tt('navigation.terms_of_service')}
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        );
    }
}
