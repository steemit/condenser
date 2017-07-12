import React from 'react';
import {connect} from 'react-redux';
import AppPropTypes from 'app/utils/AppPropTypes';
import Header from 'app/components/modules/Header';
import LpFooter from 'app/components/modules/lp/LpFooter';
import user from 'app/redux/User';
import g from 'app/redux/GlobalReducer';
import TopRightMenu from 'app/components/modules/TopRightMenu';
import { browserHistory } from 'react-router';
import classNames from 'classnames';
import SidePanel from 'app/components/modules/SidePanel';
import CloseButton from 'react-foundation-components/lib/global/close-button';
import Dialogs from 'app/components/modules/Dialogs';
import Modals from 'app/components/modules/Modals';
import Icon from 'app/components/elements/Icon';
import ScrollButton from 'app/components/elements/ScrollButton';
import {key_utils} from 'golos-js/lib/auth/ecc';
import MiniHeader from 'app/components/modules/MiniHeader';
import tt from 'counterpart';
import PageViewsCounter from 'app/components/elements/PageViewsCounter';
import {serverApiRecordEvent} from 'app/utils/ServerApiClient';
import { VEST_TICKER, WIKI_URL, LANDING_PAGE_URL, ABOUT_PAGE_URL, WHITEPAPER_URL, TERMS_OF_SERVICE_URL, PRIVACY_POLICY_URL, THEMES, DEFAULT_THEME } from 'app/client_config';
import LocalizedCurrency from 'app/components/elements/LocalizedCurrency';

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {open: null, showCallout: true, showBanner: true, expandCallout: false};
        this.toggleOffCanvasMenu = this.toggleOffCanvasMenu.bind(this);
        this.showSignUp = this.props.showSignUp.bind(this);
        // this.shouldComponentUpdate = shouldComponentUpdate(this, 'App')
    }


    componentWillMount() {
        if (process.env.BROWSER) localStorage.removeItem('autopost') // July 14 '16 compromise, renamed to autopost2
        this.props.loginUser();
        // this.initVendorScripts()
    }

    componentDidMount() {
        // setTimeout(() => this.setState({showCallout: false}), 15000);
    }

    componentDidUpdate(nextProps) {
        // setTimeout(() => this.setState({showCallout: false}), 15000);
        if (nextProps.location.pathname !== this.props.location.pathname) {
            this.setState({showBanner: false, showCallout: false})
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        const p = this.props;
        const n = nextProps;
        return nextProps.theme !== this.props.theme ||
                  p.location !== n.location ||
                  p.visitor !== n.visitor ||
                  p.flash !== n.flash || this.state !== nextState;
    }

    toggleOffCanvasMenu(e) {
        e.preventDefault();
        // this.setState({open: this.state.open ? null : 'left'});
        this.refs.side_panel.show();
    }

    handleClose = () => this.setState({open: null});

    navigate = (e) => {
        const a = e.target.nodeName.toLowerCase() === 'a' ? e.target : e.target.parentNode;
        // this.setState({open: null});
        if (a.host !== window.location.host) return;
        e.preventDefault();
        browserHistory.push(a.pathname + a.search + a.hash);
    };

    onEntropyEvent(e) {
        if(e.type === 'mousemove')
            key_utils.addEntropy(e.pageX, e.pageY, e.screenX, e.screenY)
        else
            console.log('onEntropyEvent Unknown', e.type, e)
    }

    signUp() {
        serverApiRecordEvent('Sign up', 'Hero banner');
    }

    learnMore() {
        serverApiRecordEvent('Learn more', 'Hero banner');
    }

    render() {
        const VESTING_TOKENS = tt('token_names.VESTING_TOKENS');
        const APP_NAME = tt('g.APP_NAME');

        const {location, params, children, flash, new_visitor, depositSteem, signup_bonus} = this.props;
        const theme = process.env.BROWSER ? localStorage.getItem('theme') : DEFAULT_THEME
        let currentTheme = ' theme-' + DEFAULT_THEME.toLowerCase();
        if (THEMES.indexOf(theme) !== -1) {
          currentTheme = ' theme-' + theme.toLowerCase();
        }
        const lp = false; //location.pathname === '/';
        const miniHeader = location.pathname === '/create_account';
        const params_keys = Object.keys(params);
        const ip = location.pathname === '/' || (params_keys.length === 2 && params_keys[0] === 'order' && params_keys[1] === 'category');
        const alert = this.props.error || flash.get('alert');
        const warning = flash.get('warning');
        const success = flash.get('success');
        let callout = null;
        if (this.state.showCallout && (alert || warning || success)) {
            callout = <div className="App__announcement row">
                <div className="column">
                    <div className={classNames('callout', {alert}, {warning}, {success})}>
                        <CloseButton onClick={() => this.setState({showCallout: false})} />
                        <p>{alert || warning || success}</p>
                    </div>
                </div>
            </div>;
        }
        else if (false && ip && this.state.showCallout) {
            callout = <div className="App__announcement row">
                <div className="column">
                    <div className={classNames('callout success', {alert}, {warning}, {success})}>
                        <CloseButton onClick={() => this.setState({showCallout: false})} />
                        <ul>
                            <li>
                                <a href="https://golos.io/steemit/@steemitblog/steemit-com-is-now-open-source">
                                    {tt('submit_a_story.APP_NAME_is_now_open_source', {APP_NAME})}
                                </a>
                            </li>
                            <li>
                                <a href="https://golos.io/steemit/@steemitblog/all-recovered-accounts-have-been-fully-refunded">
                                    {tt('submit_a_story.all_accounts_refunded')}
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        }
        if ($STM_Config.read_only_mode && this.state.showCallout) {
            callout = <div className="App__announcement row">
                <div className="column">
                    <div className={classNames('callout warning', {alert}, {warning}, {success})}>
                        <CloseButton onClick={() => this.setState({showCallout: false})} />
                        <p>{tt('g.read_only_mode')}</p>
                    </div>
                </div>
            </div>;
        }

        let welcome_screen = null;
        if (ip && new_visitor && this.state.showBanner) {
            welcome_screen = (
                <div className="welcomeWrapper">
                    <div className="welcomeBanner">
                        <CloseButton onClick={() => this.setState({showBanner: false})} />
                        <div className="text-center">
                            <h2>{tt('submit_a_story.welcome_to_the_blockchain')}</h2>
                            <h4>{tt('submit_a_story.your_voice_is_worth_something')}</h4>
                            <br />
                            <a className="button" href="#" onClick={this.showSignUp}> <b>{tt('navigation.sign_up')}</b> </a>
                            &nbsp; &nbsp; &nbsp;
                            <a className="button hollow uppercase" href="/welcome" target="_blank" onClick={this.learnMore}> <b>{tt('submit_a_story.learn_more')}</b> </a>
                            <br />
                            <br />
                            <div className="tag3">
                                <b>
                                  {tt('submit_a_story.get_sp_when_sign_up1')}
                                  <LocalizedCurrency amount={Number(signup_bonus)} />
                                  {tt('submit_a_story.get_sp_when_sign_up2', {VESTING_TOKENS})}
                                </b>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return <div className={'App' + currentTheme + (lp ? ' LP' : '') + (ip ? ' index-page' : '') + (miniHeader ? ' mini-header' : '')}
                    onMouseMove={this.onEntropyEvent}>
            <SidePanel ref="side_panel" alignment="right">
                <TopRightMenu vertical navigate={this.navigate} />
                <ul className="vertical menu">
                  <li>
                      <a href="/submit.html?type=submit_feedback" target="blank" onClick={this.navigate}>
                          {tt('navigation.feedback')}
                      </a>
                  </li>
                  <li>
                      <a href={WIKI_URL} target="blank" onClick={this.navigate}>
                            {tt('navigation.wiki')}
                      </a>
                  </li>
                  <li>
                      <a href="/welcome" onClick={this.navigate}>
                          {tt("navigation.welcome")}
                      </a>
                  </li>
                  <li>
                      <a href="/tags/hot" onClick={this.navigate}>
                          {tt("navigation.payouts_by_tag")}
                      </a>
                  </li>
                  <li>
                      <a href={WHITEPAPER_URL} onClick={this.navigate}>
                          {tt("navigation.APP_NAME_whitepaper", {APP_NAME})}
                      </a>
                  </li>
                  <li>
                      <a href="/market" onClick={this.navigate}>
                          {tt("navigation.currency_market")}
                      </a>
                  </li>
                  <li>
                      <a href="/recover_account_step_1" onClick={this.navigate}>
                          {tt("navigation.stolen_account_recovery")}
                      </a>
                  </li>
                  <li>
                      <a href="/change_password" onClick={this.navigate}>
                          {tt("navigation.change_account_password")}
                      </a>
                  </li>
                  <li>
                      <a href="https://chat.golos.io" target="_blank">
                          {tt("navigation.APP_NAME_chat", {APP_NAME})}&nbsp;<Icon name="extlink" />
                      </a>
                  </li>
                  <li>
                      <a href="http://golostools.com/" onClick={this.navigate} target="_blank" rel="noopener noreferrer">
                          {tt('navigation.APP_NAME_app_center', {APP_NAME})}&nbsp;<Icon name="extlink" />
                      </a>
                  </li>
                  <li className="last">
                      <a href="/~witnesses" onClick={this.navigate}>
                            {tt("navigation.witnesses")}
                      </a>
                  </li>
                </ul>
                <ul className="vertical menu">
                    <li>
                      <a href={TERMS_OF_SERVICE_URL} onClick={this.navigate} rel="nofollow">
                            {tt("navigation.terms_of_service")}
                        </a>
                    </li>
                    <li>
                      <a href={PRIVACY_POLICY_URL} onClick={this.navigate} rel="nofollow">
                            {tt("navigation.privacy_policy")}
                        </a>
                    </li>
                </ul>
            </SidePanel>
            {miniHeader ? <MiniHeader /> : <Header toggleOffCanvasMenu={this.toggleOffCanvasMenu} menuOpen={this.state.open} />}
            <div className="App__content">
                {welcome_screen}
                {callout}
                {children}
                {lp ? <LpFooter /> : null}
                <ScrollButton />
            </div>
            <Dialogs />
            <Modals />
            <PageViewsCounter />
        </div>
    }
}

App.propTypes = {
    theme: React.PropTypes.string,
    error: React.PropTypes.string,
    children: AppPropTypes.Children,
    location: React.PropTypes.object,
    signup_bonus: React.PropTypes.string,
    loginUser: React.PropTypes.func.isRequired,
    depositSteem: React.PropTypes.func.isRequired,
    showSignUp: React.PropTypes.func.isRequired
};

export default connect(
    state => {
        return {
            theme: state.user.get('theme'),
            error: state.app.get('error'),
            flash: state.offchain.get('flash'),
            signup_bonus: state.offchain.get('signup_bonus'),
            new_visitor: !state.user.get('current') &&
                !state.offchain.get('user') &&
                !state.offchain.get('account') &&
                state.offchain.get('new_visit')
        };
    },
    dispatch => ({
        loginUser: () =>
            dispatch(user.actions.usernamePasswordLogin()),
        depositSteem: () => {
            dispatch(g.actions.showDialog({name: 'blocktrades_deposit', params: {outputCoinType: VEST_TICKER}}));
        },
        showSignUp: e => {
            if (e) e.preventDefault();
            dispatch(user.actions.showSignUp())
        },
    })
)(App);
