import React from 'react';
import PropTypes from 'prop-types'
import { Link } from 'react-router';
import {connect} from 'react-redux';
import Icon from 'app/components/elements/Icon';
import user from 'app/redux/User';
import Userpic from 'app/components/elements/Userpic';
import { browserHistory } from 'react-router';
import { LinkWithDropdown } from 'react-foundation-components/lib/global/dropdown';
import VerticalMenu from 'app/components/elements/VerticalMenu';
import LoadingIndicator from 'app/components/elements/LoadingIndicator';
import tt from 'counterpart';
import { LIQUID_TICKER, DEBT_TICKER } from 'app/client_config';
import LocalizedCurrency from 'app/components/elements/LocalizedCurrency';
import { vestsToGolos, toAsset } from 'app/utils/StateFunctions';
import { WIKI_URL } from 'app/client_config';

const defaultNavigate = (e) => {
    if (e.metaKey || e.ctrlKey) {
        // prevent breaking anchor tags
    } else {
        e.preventDefault();
    }
    const a = e.target.nodeName.toLowerCase() === 'a' ? e.target : e.target.parentNode;
    browserHistory.push(a.pathname + a.search + a.hash);
};

const calculateEstimateOutput = ({ account, price_per_golos, savings_withdraws, globalprops }) => {
  if (!account) return 0;

  // Sum savings withrawals
  let savings_pending = 0, savings_sbd_pending = 0;
  if (savings_withdraws) {
    savings_withdraws.forEach(withdraw => {
      const [amount, asset] = withdraw.get('amount').split(' ');
      if (asset === LIQUID_TICKER)
        savings_pending += parseFloat(amount);
      else {
        if (asset === DEBT_TICKER)
          savings_sbd_pending += parseFloat(amount)
      }
    })
  }

  const total_sbd = 0 
    + parseFloat(account.get('sbd_balance'))
    + parseFloat(toAsset(account.get('savings_sbd_balance')).amount)
    + savings_sbd_pending

  const total_steem = 0
    + parseFloat(toAsset(account.get('balance')).amount)
    + parseFloat(toAsset(account.get('savings_balance')).amount)
    + parseFloat(vestsToGolos(account.get('vesting_shares'), globalprops.toJS()))
    + savings_pending

  return Number(((total_steem * price_per_golos) + total_sbd).toFixed(2) );
}

function TopRightMenu({account, savings_withdraws, price_per_golos, globalprops, username, showLogin, logout, loggedIn, vertical, navigate, probablyLoggedIn, location, locationQueryParams, showMessages}) {
    const APP_NAME = tt('g.APP_NAME');
    
    const mcn = 'menu' + (vertical ? ' vertical show-for-small-only' : '');
    const mcl = vertical ? '' : ' sub-menu';
    const lcn = vertical ? '' : 'show-for-large';
    const scn = vertical ? '' : 'show-for-medium';
    const nav = navigate || defaultNavigate;
    const submitStory = <li className={scn + ' submit-story'}>
        <a href="/submit" onClick={nav} className={'button small alert'}>
            <Icon name="new/add" size="0_95x" />{tt('g.submit_a_story')}
        </a>
    </li>;
    const submitStoryPencil = <li className="hide-for-medium submit-story-pencil">
        <Link to="/submit" className="button small alert">
            <Icon name="new/add" size="0_95x"/>
        </Link>
    </li>;
    const feedLink = `/@${username}/feed`;
    const repliesLink = `/@${username}/recent-replies`;
    const walletLink = `/@${username}/transfers`;
    const settingsLink = `/@${username}/settings`;
    const accountLink = `/@${username}`;
    const favoriteLink = `/@${username}/favorite`;
    const commentsLink = `/@${username}/comments`;
    const reset_password_link = `/@${username}/password`;

    const searchItem = <li className={scn}>
        <a href="/static/search.html" title={tt('g.search')}>
          {vertical ? <span>{tt('g.search')}</span> : <Icon name="new/search" size="1_25x" />}
        </a>
      </li>
    ;

    const notificationItem = <li className={scn}>
        <a href="#" title={tt('g.search')} className="number">
          <Icon name="new/bell" size="1_25x" />
          20
        </a>
      </li>
    ;

    // const messengerItem = <li className={scn}>
    //     <a href="#" title={tt('g.search')} className="number">
    //       <Icon name="new/messenger" size="1_5x" />
    //       18
    //     </a>
    //   </li>
    // ;

    const additional_menu = []
    if (!loggedIn) {
        additional_menu.push(
            { link: '/login.html', onClick: showLogin, value: tt('g.login'), className: 'show-for-small-only' },
            { link: '/create_account', value: tt('g.sign_up'), className: 'show-for-small-only' }
        )
    }
    additional_menu.push(
        { link: '/welcome', value: tt("navigation.welcome") },
        { link: WIKI_URL, value: tt('navigation.wiki'), target: 'blank' },
        { link: '/market', value: tt('userwallet_jsx.market') },
        { link: '/~witnesses', value: tt("navigation.witnesses") },
        { link: 'http://golostools.com/', value: tt('navigation.APP_NAME_app_center', { APP_NAME }), target: 'blank' },
        { link: '/recover_account_step_1', value: tt('header_jsx.stolen_account_recovery')}
    );
    const navAdditional = <LinkWithDropdown
        closeOnClickOutside
        dropdownPosition="bottom"
        dropdownAlignment="right"
        dropdownContent={<VerticalMenu className={'VerticalMenu_nav-additional'} items={additional_menu} />}
    >
        {!vertical && <li>
            <a href="#" onClick={e => e.preventDefault()}>
                <Icon name="new/more" />
            </a>
        </li>}
    </LinkWithDropdown>;

    const estimateOutputAmount = calculateEstimateOutput({ account, price_per_golos, savings_withdraws, globalprops })
    const estimateOutput = <LocalizedCurrency amount={estimateOutputAmount} />

    if (loggedIn) { // change back to if(username) after bug fix:  Clicking on Login does not cause drop-down to close #TEMP!
        let user_menu = [
            {link: feedLink, icon: 'new/home', iconSize: '1_25x', value: tt('g.feed')},
            {link: accountLink, icon: 'new/blogging', value: tt('g.blog')},
            {link: favoriteLink, icon: 'new/blogging', value: 'Избранное'},
            {link: commentsLink, icon: 'new/comment', value: tt('g.comments')},
            {link: repliesLink, icon: 'new/answer', value: tt('g.replies')},
            {link: walletLink, icon: 'new/wallet', value: tt('g.wallet')},
            {link: reset_password_link, icon: 'key', value: tt('g.change_password')},
            {link: settingsLink, icon: 'new/setting', value: tt('g.settings')},
            loggedIn ?
                {link: '#', icon: 'new/logout', onClick: logout, value: tt('g.logout')} :
                {link: '#', onClick: showLogin, value: tt('g.login')}
        ];

        if ($STM_Config.is_sandbox) {
            user_menu.splice(3, 0, {link: '#', icon: 'chatboxes', onClick: showMessages, value: tt('g.messages')});
        }
      
        const voting_power_percent = account.get('voting_power') / 100

        return (
            <ul className={mcn + mcl}>
                {searchItem}
                <li className="delim show-for-medium" />
                {submitStory}
                {!vertical && submitStoryPencil}
                <li className="delim show-for-medium" />
                <LinkWithDropdown
                    closeOnClickOutside
                    dropdownPosition="bottom"
                    dropdownAlignment="bottom"
                    dropdownContent={<VerticalMenu className={'VerticalMenu_nav-profile'} items={user_menu} title={estimateOutput} />}
                >
                    {!vertical && <li className={'Header__profile'}>
                        <a href={accountLink} title={username} onClick={e => e.preventDefault()}>
                            <Userpic account={username} showProgress={true} votingPower={account.get('voting_power')} progressClass="hide-for-large" />
                            <div className={'NavProfile show-for-large'}>
                                <div className={'NavProfile__name'}>{username}</div>
                                <div className={'NavProfile__golos'}>
                                    {tt('g.voting_capacity')}: <span className={'NavProfile__golos-percent'}>{voting_power_percent}%</span>
                                </div>
                                <div className={'NavProfile__progress'} title={`${voting_power_percent}%`}>
                                    <div className={'NavProfile__progress-percent'} style={{ width: `${voting_power_percent}%` }} />
                                </div>
                            </div>
                        </a>
                    </li>}
                </LinkWithDropdown>
                {/* <li className={"delim " + scn} /> */}
                {/* {notificationItem} */}
                {/* <li className={"delim " + scn} />
                {messengerItem} */}
                {navAdditional}
            </ul>
        );
    }

    //fixme - redesign (code duplication with USaga, UProfile)
    let externalTransfer = false;
        if (location) {
        const {pathname} = location;
        const query = locationQueryParams;
        const section = pathname.split(`/`)[2];
        const sender = (section === `transfers`) ? pathname.split(`/`)[1].substring(1) : undefined;
        // /transfers. Check query string
        if (sender && query) {
            const {to, amount, token, memo} = query;
            externalTransfer = (!!to && !!amount && !!token && !!memo);
        }
    }

    return (
        <ul className={mcn + mcl}>
            {searchItem}
            <li className="delim show-for-medium" />
            {!probablyLoggedIn && !externalTransfer && <li className={scn}>
              <a href="/login.html" onClick={showLogin} className={!vertical && 'button small violet hollow'}>{tt('g.login')}</a>
            </li>}
            {!probablyLoggedIn && <li className={scn}>
              <a href="/create_account" className={!vertical && 'button small alert'}>{tt('g.sign_up')}</a>
            </li>}
            {probablyLoggedIn && <li className={lcn}>
              <LoadingIndicator type="circle" inline />
            </li>}
            {navAdditional}
        </ul>
    );
}

TopRightMenu.propTypes = {
    username: PropTypes.string,
    loggedIn: PropTypes.bool,
    probablyLoggedIn: PropTypes.bool,
    showLogin: PropTypes.func.isRequired,
    logout: PropTypes.func.isRequired,
    vertical: PropTypes.bool,
    navigate: PropTypes.func,
};

export default connect(
    state => {
        if (!process.env.BROWSER) {
            return {
                username: null,
                loggedIn: false,
                probablyLoggedIn: !!state.offchain.get('account')
            }
        }
        const username = state.user.getIn(['current', 'username']);
        const account  = state.global.getIn(['accounts', username]);
        const loggedIn = !!username;

        const savings_withdraws = state.user.get('savings_withdraws');
        const price_per_golos = state.global.getIn(['rates', 'GBG', 'GOLOS']);
        const globalprops = state.global.get('props');

        return {
            account,
            username,
            loggedIn,
            savings_withdraws,
            price_per_golos,
            globalprops,
            probablyLoggedIn: false
        }
    },
    dispatch => ({
        showLogin: e => {
            if (e) e.preventDefault();
            dispatch(user.actions.showLogin())
        },
        logout: e => {
            if (e) e.preventDefault();
            dispatch(user.actions.logout())
        },
        showMessages: (e) => {
            if (e) e.preventDefault();
            dispatch(user.actions.showMessages())
        }
    })
)(TopRightMenu);
