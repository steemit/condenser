import React from 'react';
import tt from 'counterpart';
import CloseButton from 'react-foundation-components/lib/global/close-button';
import { LIQUID_TOKEN } from 'app/client_config';
import Icon from 'app/components/elements/Icon';
import { Link } from 'react-router';

//TODO: MAKE STATELESS AND PURE.
export default class SidePanel extends React.Component {
    static propTypes = {
        children: React.PropTypes.array,
        alignment: React.PropTypes.string,
    };

    constructor(props) {
        super(props);
    }

    render() {
        const {
            children,
            alignment,
            navigate,
            visible,
            showSidePanel,
            hideSidePanel,
        } = this.props;
        const buySteemLink = (
            <li>
                {/*TODO: pass this as dispatch via connected*/}
                <a onClick={() => depositSteem(username)}>
                    {tt('navigation.buy_LIQUID_TOKEN', {
                        LIQUID_TOKEN,
                    })}&nbsp;<Icon name="extlink" />
                </a>
            </li>
        );

        const makeExternalLink = (i, ix, arr) => {
            const cn = ix === arr.length - 1 ? 'last' : null;
            return (
                <li key={i.value} className={cn}>
                    <a href={i.link} target="_blank" rel="noopener noreferrer">
                        {i.label}&nbsp;<Icon name="extlink" />
                    </a>
                </li>
            );
        };

        const makeInternalLink = (i, ix, arr) => {
            const cn = ix === arr.length - 1 ? 'last' : null;
            return (
                <li key={i.value} className={cn}>
                    <Link to={i.link}>{i.label}</Link>
                </li>
            );
        };

        const sidePanelLinks = {
            internal: [
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
            ],
            external: [
                {
                    value: 'shop',
                    label: tt('navigation.shop'),
                    link: 'https://thesteemitshop.com/',
                },
                {
                    value: 'chat',
                    label: tt('navigation.chat'),
                    link: 'https://steemit.chat/home',
                },
                {
                    value: 'tools',
                    label: tt('navigation.app_center'),
                    link: 'http://steemtools.com/',
                },
                {
                    value: 'api_docs',
                    label: tt('navigation.api_docs'),
                    link: 'https://developers.steem.io/',
                },
            ],
            organizational: [
                {
                    value: 'bluepaper',
                    label: tt('navigation.bluepaper'),
                    link: 'https://steem.io/steem-bluepaper.pdf',
                },
                {
                    value: 'smt_whitepaper',
                    label: tt('navigation.smt_whitepaper'),
                    link: 'https://smt.steem.io/',
                },
                {
                    value: 'whitepaper',
                    label: tt('navigation.whitepaper'),
                    link: 'https://steem.io/SteemWhitePaper.pdf',
                },
                {
                    value: 'about',
                    label: tt('navigation.about'),
                    link: 'https://steem.io',
                },
            ],
            legal: [
                {
                    value: 'privacy',
                    label: tt('navigation.privacy_policy'),
                    link: '/privacy.html',
                },
                {
                    value: 'tos',
                    label: tt('navigation.terms_of_service'),
                    link: '/tos.html',
                },
            ],
        };

        return (
            <div className="SidePanel">
                <div className={(visible ? 'visible ' : '') + alignment}>
                    <CloseButton onClick={hideSidePanel} />
                    <ul className="vertical menu">
                        {sidePanelLinks['internal'].map(makeInternalLink)}
                    </ul>
                    <ul className="vertical menu">
                        {buySteemLink}
                        {sidePanelLinks['external'].map(makeExternalLink)}
                    </ul>
                    <ul className="vertical menu">
                        {buySteemLink}
                        {sidePanelLinks['organizational'].map(makeExternalLink)}
                    </ul>
                    <ul className="vertical menu">
                        {buySteemLink}
                        {sidePanelLinks['legal'].map(makeInternalLink)}
                    </ul>
                </div>
            </div>
        );
    }
}
