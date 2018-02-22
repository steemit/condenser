import React from 'react';
import tt from 'counterpart';
import CloseButton from 'react-foundation-components/lib/global/close-button';
import { LIQUID_TOKEN } from 'app/client_config';
import Icon from 'app/components/elements/Icon';
import { Link } from 'react-router';

export default class SidePanel extends React.Component {
    static propTypes = {
        children: React.PropTypes.array,
        alignment: React.PropTypes.string,
    };

    constructor(props) {
        super(props);
        this.state = { visible: false };
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

        const buySteemLink = 
        <li>
            {/*TODO: pass this as dispatch via connected*/}
            <a onClick={() => depositSteem(username)}>
                {tt('navigation.buy_LIQUID_TOKEN', {
                    LIQUID_TOKEN,
                })}&nbsp;<Icon name="extlink" />
            </a>
        </li>

        const internalLinks = [
            {
                value: 'welcome',
                label: tt('navigation.welcome'),
                link: `/welcome`,
            },
            {
                value: 'faq',
                label: tt('navigation.faq'),
                link: `/faq`,
            },
            {
                value: 'tags',
                label: tt('navigation.explore'),
                link: `/tags`,
            },
            {
                value: 'market',
                label: tt('navigation.currency_market'),
                link: `/market`,
            },
            {
                value: 'recover_account_step_1',
                label: tt('navigation.stolen_account_recovery'),
                link: `/recover_account_step_1`,
            },
            {
                value: 'change_password',
                label: tt('navigation.change_account_password'),
                link: `/change_password`,
            },
            {
                value: 'vote_for_witnesses',
                label: tt('navigation.vote_for_witnesses'),
                link: `/~witnesses`,
            },
        ];

        const externalLinks = [
            {
                value:'shop',
                label:tt('navigation.shop'),
                link:'https://thesteemitshop.com/',
            },
            {
                value:'chat',
                label:tt('navigation.chat'),
                link:'https://steemit.chat/home',
            },
            {
                value:'tools',
                label:tt('navigation.app_center'),
                link:'http://steemtools.com/',
            },
            {
                value:'api_docs',
                label:tt('navigation.api_docs'),
                link:'https://developers.steem.io/',
            },
        ];

        const orgLinks = [
            {
                value:'bluepaper',
                label:tt('navigation.bluepaper'),
                link:'https://steem.io/steem-bluepaper.pdf',
            },
            {
                value:'smt_whitepaper',
                label:tt('navigation.smt_whitepaper'),
                link:'https://smt.steem.io/',
            },
            {
                value:'whitepaper',
                label:tt('navigation.whitepaper'),
                link:'https://steem.io/SteemWhitePaper.pdf',
            },
            {
                value:'about',
                label:tt('navigation.about'),
                link:'https://steem.io',
            },
        ]

        return (
            <div className="SidePanel">
                <div className={(visible ? 'visible ' : '') + alignment}>
                    <CloseButton onClick={this.hide} />
                    <ul className="vertical menu">
                        {internalLinks.map((i, ix, arr) => {
                            const cn = ix === arr.length - 1 ? 'last' : null
                            return (
                                <li key={i.value} className={cn}>
                                    <Link to={i.link}>{i.label}</Link>
                                </li>
                            )
                        })}
                    </ul>
                    <ul className="vertical menu">
                        {buySteemLink}
                        {external.map((i, ix, arr) => {
                            const cn = ix === arr.length - 1 ? 'last' : null
                            return (
                                <li key={i.value} className={cn}>
                                    <a
                                        href={i.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {i.label}&nbsp;<Icon name="extlink" />
                                    </a>
                                </li>
                            )
                        })}
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
                            <a href="https://steem.io" onClick={navigate}>
                                {tt('navigation.about')}&nbsp;<Icon name="extlink" />
                            </a>
                        </li>
                        <li>
                            <a
                                href="/privacy.html"
                                onClick={navigate}
                                rel="nofollow"
                            >
                                {tt('navigation.privacy_policy')}
                            </a>
                        </li>
                        <li className="last">
                            <a
                                href="/tos.html"
                                onClick={navigate}
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
