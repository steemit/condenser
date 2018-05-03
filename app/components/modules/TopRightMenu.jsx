import React from 'react';
import { Link } from 'react-router';
import {connect} from 'react-redux';
import Icon from 'app/components/elements/Icon';
import user from 'app/redux/User';
import Userpic from 'app/components/elements/Userpic';
import { browserHistory } from 'react-router';
import { LinkWithDropdown } from 'react-foundation-components/lib/global/dropdown';
import VerticalMenu from 'app/components/elements/VerticalMenu';
import LoadingIndicator from 'app/components/elements/LoadingIndicator';
import NotifiCounter from 'app/components/elements/NotifiCounter';
import tt from 'counterpart';
import { LIQUID_TICKER, DEBT_TICKER } from 'app/client_config';
import LocalizedCurrency from 'app/components/elements/LocalizedCurrency';
import {vestingSteem} from 'app/utils/StateFunctions';
import { getURL } from 'app/utils/URLConstants'

const defaultNavigate = (e) => {
    if (e.metaKey || e.ctrlKey) {
        // prevent breaking anchor tags
    } else {
        e.preventDefault();
    }
    const a = e.target.nodeName.toLowerCase() === 'a' ? e.target : e.target.parentNode;
    browserHistory.push(a.pathname + a.search + a.hash);
};

const calculateEstimateOutput = ({a, p, sw, g}) => {
  if (!a)
    return 0;

  // Sum savings withrawals
  let savings_pending = 0, savings_sbd_pending = 0;
  if (sw) {
    sw.forEach(withdraw => {
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
    // sbd_balance
    + parseFloat(a.get('sbd_balance'))
    // sbd_balance_savings
    + parseFloat(a.get('savings_sbd_balance').split(' ')[0])
    + savings_sbd_pending
    // + conversionValue
    // + sbdOrders
  ;
  const total_steem = 0
    // balance_steem
    + parseFloat(a.get('balance').split(' ')[0])
    // saving_balance_steem
    + parseFloat(a.get('savings_balance').split(' ')[0])
    // vesting_steem
    + vestingSteem(a.toJS(), g.toJS())
    + savings_pending
    // + steemOrders
  ;
  return Number( ( (total_steem * p) + total_sbd).toFixed(2) );
}

function TopRightMenu({account, savings_withdraws, price_per_golos, globalprops, username, showLogin, logout, loggedIn, vertical, navigate, probablyLoggedIn, location, locationQueryParams}) {
    const mcn = 'menu' + (vertical ? ' vertical show-for-small-only' : '');
    const mcl = vertical ? '' : ' sub-menu';
    const lcn = vertical ? '' : 'show-for-medium';
    const nav = navigate || defaultNavigate;
    const submitStory = <li className={lcn + ' submit-story'}>
      <a href="/submit.html" onClick={nav} className={'button small alert'}>{tt('g.submit_a_story')}</a>
    </li>;
    const submitStoryPencil = <li className="show-for-small-only">
      <Link to="/submit.html"><Icon name="pencil" /></Link>
    </li>;
    const feedLink = `/@${username}/feed`;
    const repliesLink = `/@${username}/recent-replies`;
    const walletLink = `/@${username}/transfers`;
    const settingsLink = `/@${username}/settings`;
    const accountLink = `/@${username}`;
    const commentsLink = `/@${username}/comments`;
    const reset_password_link = `/@${username}/password`;

    const inIco = location && location.pathname.indexOf("/about") == 0;
    const searchItem = <li className={lcn}>
        <a href="/static/search.html" title={tt('g.search')}>
          {vertical ? <span>{tt('g.search')}</span> : <Icon name="search" size="1_5x" />}
        </a>
      </li>
    ;

    const notificationItem = <li className={lcn}>
        <a href="/static/search.html" title={tt('g.search')} className="number">
          {vertical ? <span>{tt('g.search')}</span> : <Icon name="new/bell" size="1_5x" />}
          20
        </a>
      </li>
    ;
    const messengerItem = <li className={lcn}>
        <a href="/static/search.html" title={tt('g.search')} className="number">
          {vertical ? <span>{tt('g.search')}</span> : <Icon name="new/messenger" size="1_5x" />}
          18
        </a>
      </li>
    ;

    const estimateOutput = <LocalizedCurrency amount={calculateEstimateOutput({a:account, p: price_per_golos, sw: savings_withdraws, g: globalprops})} />;

    if (loggedIn) { // change back to if(username) after bug fix:  Clicking on Login does not cause drop-down to close #TEMP!
        const APP_NAME = tt('g.APP_NAME');

        const user_menu = [
            {link: feedLink, icon: 'new/home', iconSize: '1_25x', value: tt('g.feed'), addon: <NotifiCounter fields="feed" />},
            {link: accountLink, icon: 'new/blogging', value: tt('g.blog')},
            {link: commentsLink, icon: 'new/comment', value: tt('g.comments')},
            {link: repliesLink, icon: 'new/answer', value: tt('g.replies'), addon: <NotifiCounter fields="comment_reply" />},
            {link: walletLink, icon: 'new/wallet', value: tt('g.wallet'), addon: <NotifiCounter fields="follow,send,receive,account_update" />},
            {link: reset_password_link, icon: 'key', value: tt('g.change_password')},
            {link: settingsLink, icon: 'new/setting', value: tt('g.settings')},
            loggedIn ?
                {link: '#', icon: 'new/logout', onClick: logout, value: tt('g.logout')} :
                {link: '#', onClick: showLogin, value: tt('g.login')}
        ];

        const additional_menu = [
            {link: '/welcome', value: tt("navigation.welcome")},
            {link: getURL('WIKI_URL'), value: tt('navigation.wiki')},
            {link: '/market', value: tt('userwallet_jsx.market')},
            {link: '/~witnesses', value: tt("navigation.witnesses")},
            {link: 'http://golostools.com/', value: tt('navigation.APP_NAME_app_center', {APP_NAME})}
        ];

        const voting_power_percent = account.get('voting_power') / 100

        return (
            <ul className={mcn + mcl}>
                {!inIco && searchItem}
                {!inIco && <li className="delim show-for-medium" />}
                {!inIco && submitStory}
                {!inIco && !vertical && submitStoryPencil}
                {!inIco && <li className="delim show-for-medium" />}
                <LinkWithDropdown
                    closeOnClickOutside
                    dropdownPosition="bottom"
                    dropdownAlignment="bottom"
                    dropdownContent={<VerticalMenu className={'VerticalMenu_nav-profile'} items={user_menu} title={estimateOutput} />}
                >
                    {!vertical && <li className={'Header__profile'}>
                        <a href={accountLink} title={username} onClick={e => e.preventDefault()}>
                            <Userpic account={username} />
                            <div className={'NavProfile show-for-medium'}>
                                <div className={'NavProfile__name'}>{username}</div>
                                <div className={'NavProfile__golos'}>
                                    {tt('g.voting_capacity')}: <span className={'NavProfile__golos-percent'}>{voting_power_percent}%</span>
                                </div>
                                <div className={'NavProfile__progress'} title={`${voting_power_percent}%`}>
                                    <div className={'NavProfile__progress-percent'} style={{ width: `${voting_power_percent}%` }} />
                                </div>
                            </div>
                        </a>
                        <div className="TopRightMenu__notificounter"><NotifiCounter fields="total" /></div>
                    </li>}
                </LinkWithDropdown>
                {/* {!inIco && <li className="delim show-for-medium" />}
                {!inIco && notificationItem}
                {!inIco && <li className="delim show-for-medium" />}
                {!inIco && messengerItem} */}
                <LinkWithDropdown
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
                </LinkWithDropdown>
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
            {!inIco && searchItem}
            <li className="delim show-for-medium" />
            {!inIco && !probablyLoggedIn && !externalTransfer && <li className={lcn}>
              <a href="/login.html" onClick={showLogin} className={!vertical && 'button small login hollow'}>{tt('g.login')}</a>
            </li>}
            {!inIco && !probablyLoggedIn && <li className={lcn}>
              <a href="/create_account" className={!vertical && 'button small alert'}>{tt('g.sign_up')}</a>
            </li>}
            {probablyLoggedIn && <li className={lcn}>
              <LoadingIndicator type="circle" inline />
            </li>}
        </ul>
    );
}

TopRightMenu.propTypes = {
    username: React.PropTypes.string,
    loggedIn: React.PropTypes.bool,
    probablyLoggedIn: React.PropTypes.bool,
    showLogin: React.PropTypes.func.isRequired,
    logout: React.PropTypes.func.isRequired,
    vertical: React.PropTypes.bool,
    navigate: React.PropTypes.func,
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
        let price_per_golos = undefined;
        const feed_price = state.global.get('feed_price');
        if(feed_price && feed_price.has('base') && feed_price.has('quote')) {
            const {base, quote} = feed_price.toJS()
            if(/ GBG$/.test(base) && / GOLOS$/.test(quote))
                price_per_golos = parseFloat(base.split(' ')[0]) / parseFloat(quote.split(' ')[0])
        }
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
        }
    })
)(TopRightMenu);
