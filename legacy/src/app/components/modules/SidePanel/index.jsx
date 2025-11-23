import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import tt from 'counterpart';
import * as appActions from 'app/redux/AppReducer';
import CloseButton from 'app/components/elements/CloseButton';
import Icon from 'app/components/elements/Icon';
import { Link } from 'react-router';

const SidePanel = ({
    alignment,
    visible,
    hideSidePanel,
    showSidePanel,
    username,
    walletUrl,
    nightmode,
    toggleNightmode,
    user_preferences,
    setUserPreferences,
}) => {
    const documentClick = e => {
        console.log(e.target.nodeName);
        console.log(visible);
        hideSidePanel();
    };
    if (process.env.BROWSER) {
        visible && document.addEventListener('click', hideSidePanel);
        !visible && document.removeEventListener('click', hideSidePanel);
    }

    const loggedIn =
        username === undefined
            ? 'show-for-small-only'
            : 'SidePanel__hide-signup';
    const refCb = dom => {
        dom &&
            dom.addEventListener('click', e => {
                e.stopPropagation();
            });
    };
    const handleLanguageChange = event => {
        const locale = event.target.value;
        const userPreferences = { ...user_preferences, locale };
        // console.log(locale);
        setUserPreferences(userPreferences);
        hideSidePanel();
    };
    const makeLink = (i, ix, arr) => {
        // A link is internal if it begins with a slash
        const isExternal = !i.link.match(/^\//) || i.isExternal;
        const cn = ix === arr.length - 1 ? 'last' : null;
        if (i.key === 'switchLanguage') {
            return (
                <li key={ix} className={cn}>
                    <select
                        defaultValue={user_preferences.locale}
                        onChange={e => handleLanguageChange(e)}
                        onClick={e => e.nativeEvent.stopImmediatePropagation()}
                        className="language"
                    >
                        <option value="en">English</option>
                        <option value="fr">French français</option>
                        <option value="it">Italian italiano</option>
                        <option value="ja">Japanese 日本語</option>
                        <option value="ko">Korean 한국어</option>
                        <option value="pl">Polish</option>
                        <option value="ru">Russian русский</option>
                        <option value="es">Spanish Español</option>
                        <option value="uk">Ukranian Українська</option>
                    </select>
                </li>
            );
        }
        if (isExternal) {
            return (
                <li key={ix} className={cn}>
                    <a href={i.link} target="_blank" rel="noopener noreferrer">
                        {i.label}&nbsp;<Icon name="extlink" />
                    </a>
                </li>
            );
        }
        if (i.onClick) {
            return (
                <li key={ix} className={cn}>
                    <a onClick={i.onClick}>{i.label}</a>
                </li>
            );
        }
        return (
            <li key={ix} className={cn}>
                <Link to={i.link}>{i.label}</Link>
            </li>
        );
    };

    const sidePanelLinks = {
        internal: [
            {
                label: tt('navigation.welcome'),
                link: `/welcome`,
            },
            {
                label: tt('navigation.language'),
                link: '/',
                key: `switchLanguage`,
            },
            {
                label: tt('navigation.faq'),
                link: `/faq.html`,
            },
            /*
            {
                label: tt('navigation.explore'),
                link: `/communities`,
            },
            */
            {
                label: nightmode
                    ? tt('g.toggle_daymode')
                    : tt('g.toggle_nightmode'),
                link: '/',
                onClick: toggleNightmode,
            },
        ],
        exchanges: [
            {
                value: 'poloniex',
                label: 'Poloniex',
                link: 'https://poloniex.com/exchange#trx_steem',
            },
        ],
        wallet: [
            {
                label: tt('navigation.stolen_account_recovery'),
                link: `${walletUrl}/recover_account_step_1`,
            },
            {
                label: tt('navigation.change_account_password'),
                link: `${walletUrl}/change_password`,
            },
            {
                label: tt('navigation.vote_for_witnesses'),
                link: `${walletUrl}/~witnesses`,
            },
            {
                label: tt('navigation.steem_proposals'),
                link: `${walletUrl}/proposals`,
            },
        ],

        external: [
            /*
            {
                label: tt('navigation.chat'),
                link: 'https://steem.chat/home',
            },
            */
            {
                label: tt('navigation.advertise'),
                link: 'https://selfserve.steemit.com',
            },
            {
                label: tt('navigation.jobs'),
                link:
                    'https://recruiting.paylocity.com/recruiting/jobs/List/3288/Steemit-Inc',
            },
            /*
            {
                label: tt('navigation.app_center'),
                link: 'https://steemprojects.com/',
            },
            {
                label: tt('navigation.business_center'),
                link: 'https://steemeconomy.com/',
            },*/
        ],

        organizational: [
            {
                label: tt('navigation.api_docs'),
                link: 'https://developers.steem.io/',
            },
            {
                label: tt('navigation.bluepaper'),
                link: 'https://steem.io/steem-bluepaper.pdf',
            },
            {
                label: tt('navigation.smt_whitepaper'),
                link: 'https://smt.steem.io/',
            },
            {
                label: tt('navigation.whitepaper'),
                link: 'https://steem.com/SteemWhitePaper.pdf',
            },
        ],

        legal: [
            {
                label: tt('navigation.privacy_policy'),
                link: '/privacy.html',
            },
            {
                label: tt('navigation.terms_of_service'),
                link: '/tos.html',
            },
        ],

        extras: [
            {
                label: tt('g.sign_in'),
                link: '/login.html',
            },
            {
                label: tt('g.sign_up'),
                link: 'https://signup.steemit.com',
            },
        ],
    };

    return (
        <div className="SidePanel">
            <div className={(visible ? 'visible ' : '') + alignment}>
                <CloseButton onClick={hideSidePanel} />
                <ul className={`vertical menu ${loggedIn}`}>
                    {sidePanelLinks.extras.map(makeLink)}
                </ul>
                <ul className="vertical menu">
                    {sidePanelLinks.internal.map(makeLink)}
                </ul>
                <ul className="vertical menu">
                    {sidePanelLinks.wallet.map(makeLink)}
                </ul>
                <ul className="vertical menu">
                    <li>
                        <a className="menu-section">
                            {tt('navigation.third_party_exchanges')}
                        </a>
                    </li>
                    {sidePanelLinks.exchanges.map(makeLink)}
                </ul>
                <ul className="vertical menu">
                    {sidePanelLinks.external.map(makeLink)}
                </ul>
                <ul className="vertical menu">
                    {sidePanelLinks.organizational.map(makeLink)}
                </ul>
                <ul className="vertical menu">
                    {sidePanelLinks.legal.map(makeLink)}
                </ul>
            </div>
        </div>
    );
};

SidePanel.propTypes = {
    alignment: PropTypes.oneOf(['left', 'right']).isRequired,
    visible: PropTypes.bool.isRequired,
    hideSidePanel: PropTypes.func.isRequired,
    username: PropTypes.string,
    toggleNightmode: PropTypes.func.isRequired,
};

SidePanel.defaultProps = {
    username: undefined,
};

export default connect(
    (state, ownProps) => {
        const walletUrl = state.app.get('walletUrl');
        const nightmode = state.app.getIn(['user_preferences', 'nightmode']);
        return {
            walletUrl,
            nightmode,
            user_preferences: state.app.get('user_preferences').toJS(),
            ...ownProps,
        };
    },
    dispatch => ({
        toggleNightmode: e => {
            if (e) e.preventDefault();
            dispatch(appActions.toggleNightmode());
        },
        setUserPreferences: payload => {
            dispatch(appActions.setUserPreferences(payload));
        },
    })
)(SidePanel);
