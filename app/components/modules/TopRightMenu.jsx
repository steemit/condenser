import Immutable from 'immutable';
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
import store from 'store';
import {APP_NAME, DEFAULT_LANGUAGE, LANGUAGES, LIQUID_TICKER, DEBT_TICKER} from 'app/client_config';
import LocalizedCurrency from 'app/components/elements/LocalizedCurrency';
import {vestingSteem} from 'app/utils/StateFunctions';

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

function TopRightMenu({account, savings_withdraws, price_per_golos, globalprops, username, showLogin, logout, loggedIn, vertical, navigate, toggleOffCanvasMenu, probablyLoggedIn, showSignUp, location, changeLanguage}) {
    const mcn = 'menu' + (vertical ? ' vertical show-for-small-only' : '');
    const mcl = vertical ? '' : ' sub-menu';
    const lcn = vertical ? '' : 'show-for-medium';
    const nav = navigate || defaultNavigate;
    const submitStory = $STM_Config.read_only_mode ? null : <li className={lcn + ' submit-story'}>
      <a href="/submit.html" onClick={nav}>{tt('g.submit_a_story')}</a>
    </li>;
    const submitStoryPencil = $STM_Config.read_only_mode ? null : <li className="show-for-small-only">
      <Link to="/submit.html"><Icon name="pencil" /></Link>
    </li>;
    const feedLink = `/@${username}/feed`;
    const repliesLink = `/@${username}/recent-replies`;
    const walletLink = `/@${username}/transfers`;
    const settingsLink = `/@${username}/settings`;
    const accountLink = `/@${username}`;
    const commentsLink = `/@${username}/comments`;
    const postsLink = `/@${username}/posts`;
    const reset_password_link = `/@${username}/password`;

    const inIco = location && location.pathname.indexOf("/about") == 0;
    const ico_menu = [
        {link: '#what-is-golos', value: tt('g.video')},
        {link: '#docs', value: tt('g.documentation')},
        {link: '#faq', value: tt('navigation.faq')},
        {link: '#team', value: tt('g.team')},
    ];
    let currentLang = LANGUAGES[DEFAULT_LANGUAGE].substr(0,3).toUpperCase();
    const lang_menu = [];
    for (var key in LANGUAGES) {
      if (store.get('language') === key)
        currentLang = LANGUAGES[key].substr(0,3).toUpperCase();
      else
        lang_menu.push({link: '#' + key, onClick: changeLanguage, value: LANGUAGES[key]})
    }
    const aboutItem = <li className={lcn}>
        <Link to="/about" title={tt('g.about_project')}>
          {vertical ? <span>{tt('g.about_project')}</span> : <Icon name="info_o" />}
        </Link>
      </li>
    ;
    const submitFeedback = <li className={lcn}>
        <Link to="/submit.html?type=submit_feedback" title={tt('navigation.feedback')}>
          <Icon name="feedback" />
        </Link>
      </li>
    ;
    const searchItem = <li className={lcn}>
        <a href="/static/search.html" title={tt('g.search')}>
          {vertical ? <span>{tt('g.search')}</span> : <Icon name="search" />}
        </a>
      </li>
    ;
    const languageMenu = <LinkWithDropdown
        closeOnClickOutside
        dropdownPosition="bottom"
        dropdownAlignment="right"
        dropdownContent={<VerticalMenu items={lang_menu} title={tt('settings_jsx.choose_language')} />}
        >
            {!vertical && <li className={lcn + ' languages'}>
                <a title={tt('settings_jsx.choose_language')} onClick={e => e.preventDefault()}>
                    <small>{currentLang}</small>
                </a>
            </li>}
        </LinkWithDropdown>
    ;
    const rocketchatItem = !vertical ? <li className={lcn + ' wrap-rocket-chat'}>
        <a href="https://chat.golos.io/" title={tt("navigation.APP_NAME_chat", {APP_NAME})} target="_blank">
          <Icon name="rocket-chat" />
        </a>
      </li>
      : null
    ;
    const estimateOutput = <LocalizedCurrency amount={calculateEstimateOutput({a:account, p: price_per_golos, sw: savings_withdraws, g: globalprops})} />;

    if (loggedIn) { // change back to if(username) after bug fix:  Clicking on Login does not cause drop-down to close #TEMP!
        const user_menu = [
            {link: feedLink, icon: 'home', value: tt('g.feed'), addon: <NotifiCounter fields="feed" />},
            {link: accountLink, icon: 'profile', value: tt('g.blog')},
            {link: commentsLink, icon: 'replies', value: tt('g.comments')},
            {link: repliesLink, icon: 'reply', value: tt('g.replies'), addon: <NotifiCounter fields="comment_reply" />},
            {link: walletLink, icon: 'wallet', value: tt('g.wallet'), addon: <NotifiCounter fields="follow,send,receive,account_update" />},
            {link: reset_password_link, icon: 'key', value: tt('g.change_password')},
            {link: settingsLink, icon: 'cog', value: tt('g.settings')},
            loggedIn ?
                {link: '#', icon: 'enter', onClick: logout, value: tt('g.logout')} :
                {link: '#', onClick: showLogin, value: tt('g.login')}
        ];
        return (
            <ul className={mcn + mcl}>
                {inIco && ico_menu.map((o,i) => {return <li key={i} className={lcn}><a href={o.link}>{o.value}</a></li>})}
                {!inIco && aboutItem}
                {!inIco && !vertical && submitFeedback}
                {!inIco && searchItem}
                {!inIco && languageMenu}
                {!inIco && rocketchatItem}
                {!inIco && submitStory}
                {!inIco && !vertical && submitStoryPencil}
                <LinkWithDropdown
                    closeOnClickOutside
                    dropdownPosition="bottom"
                    dropdownAlignment="right"
                    dropdownContent={<VerticalMenu items={user_menu} title={username} description={estimateOutput} />}
                >
                    {!vertical && <li className={'Header__userpic '}>
                        <a href={accountLink} title={username} onClick={e => e.preventDefault()}>
                            <Userpic account={username} />
                        </a>
                        <div className="TopRightMenu__notificounter"><NotifiCounter fields="total" /></div>
                    </li>}
                </LinkWithDropdown>
                {toggleOffCanvasMenu && <li className="toggle-menu"><a href="#" onClick={toggleOffCanvasMenu}>
                    <span className="hamburger" />
                </a></li>}
            </ul>
        );
    }
    return (
        <ul className={mcn + mcl}>
            {inIco && ico_menu.map((o,i) => {return <li key={i} className={lcn}><a href={o.link}>{o.value}</a></li>})}
            {!inIco && aboutItem}
            {!inIco && !vertical && <li>
              <a href="/submit.html?type=submit_feedback" title={tt('navigation.feedback')}>
                <Icon name="feedback" />
              </a>
            </li>}
            {!inIco && !vertical && languageMenu}
            {!inIco && rocketchatItem}
            {!inIco && !probablyLoggedIn && <li className={lcn}>
              <a href="/create_account" onClick={showSignUp}>{tt('g.sign_up')}</a>
            </li>}
            {!inIco && !probablyLoggedIn && <li className={lcn}>
              <a href="/login.html" onClick={showLogin}>{tt('g.login')}</a>
            </li>}
            {!inIco && !probablyLoggedIn && !vertical && submitStoryPencil}
            {!inIco && !probablyLoggedIn && submitStory}
            {probablyLoggedIn && <li className={lcn}>
              <LoadingIndicator type="circle" inline />
            </li>}
            {toggleOffCanvasMenu && <li className="toggle-menu">
              <a href="#" onClick={toggleOffCanvasMenu}>
                <span className="hamburger" />
              </a>
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
    toggleOffCanvasMenu: React.PropTypes.func,
    showSignUp: React.PropTypes.func.isRequired
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
        changeLanguage: e => {
            if (e) e.preventDefault();
            const targetLanguage = e.target.text.trim();
            let language = DEFAULT_LANGUAGE;
            for (var key in LANGUAGES) {
              if (targetLanguage.localeCompare(LANGUAGES[key]) == 0)
                language = key
            }
            store.set('language', language)
            dispatch(user.actions.changeLanguage(language))
        },
        showLogin: e => {
            if (e) e.preventDefault();
            dispatch(user.actions.showLogin())
        },
        showSignUp: e => {
            if (e) e.preventDefault();
            dispatch(user.actions.showSignUp())
        },
        logout: e => {
            if (e) e.preventDefault();
            dispatch(user.actions.logout())
        }
    })
)(TopRightMenu);
