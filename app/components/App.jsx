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
import {key_utils} from 'shared/ecc'
import { translate } from 'app/Translator';
import { TERMS_OF_SERVICE_URL, WIKI_URL, PRIVACY_POLICY_URL, SEGMENT_ANALYTICS_KEY, LANDING_PAGE_URL, WHITEPAPER_URL, VEST_TICKER } from 'config/client_config';
import { localizedCurrency } from 'app/components/elements/LocalizedCurrency';

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {open: null, showCallout: true, showBanner: true, expandCallout: false};
        this.toggleOffCanvasMenu = this.toggleOffCanvasMenu.bind(this);
        // this.shouldComponentUpdate = shouldComponentUpdate(this, 'App')
    }

    componentWillMount() {

        if (process.env.BROWSER) localStorage.removeItem('autopost') // July 14 '16 compromise, renamed to autopost2
        this.props.loginUser();
        // SEGMENT.COM ANALYTICS INITIALIZATION
    	if (process.env.BROWSER) {
            !function(){var analytics=window.analytics=window.analytics||[];if(!analytics.initialize)if(analytics.invoked)window.console&&console.error&&console.error("Segment snippet included twice.");else{analytics.invoked=!0;analytics.methods=["trackSubmit","trackClick","trackLink","trackForm","pageview","identify","reset","group","track","ready","alias","page","once","off","on"];analytics.factory=function(t){return function(){var e=Array.prototype.slice.call(arguments);e.unshift(t);analytics.push(e);return analytics}};for(var t=0;t<analytics.methods.length;t++){var e=analytics.methods[t];analytics[e]=analytics.factory(e)}analytics.load=function(t){var e=document.createElement("script");e.type="text/javascript";e.async=!0;e.src=("https:"===document.location.protocol?"https://":"http://")+"cdn.segment.com/analytics.js/v1/"+t+"/analytics.min.js";var n=document.getElementsByTagName("script")[0];n.parentNode.insertBefore(e,n)};analytics.SNIPPET_VERSION="3.1.0";
            analytics.load(SEGMENT_ANALYTICS_KEY);
            analytics.page()
            }}();

            (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
            (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
            m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
            })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

            ga('create', 'UA-49238979-12', 'auto');
            ga('send', 'pageview');

            !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
            n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
            document,'script','https://connect.facebook.net/en_US/fbevents.js');

            fbq('init', '1594659427507927');
            fbq('track', "PageView");
        }
    }

    componentDidMount() {
        require('fastclick').attach(document.body);
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
        return p.location !== n.location ||
                  p.loading !== n.loading ||
                  p.visitor !== n.visitor ||
                  p.flash !== n.flash || this.state !== nextState;
    }

    toggleOffCanvasMenu(e) {
        e.preventDefault();
        // this.setState({open: this.state.open ? null : 'left'});
        this.refs.side_panel.show();
        console.log('sidebar menu toggled')
        analytics.track('sidebar menu toggled')
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
    render() {
        const {location, params, children, loading, flash, showSignUp, new_visitor,
            depositSteem, signup_bonus} = this.props;
        const lp = false; //location.pathname === '/';
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
                                <a href="https://steemit.com/steemit/@steemitblog/steemit-com-is-now-open-source">
                                    {translate('APP_URL_is_now_open_source')}
                                </a>
                            </li>
                            <li>
                                <a href="https://steemit.com/steemit/@steemitblog/all-recovered-accounts-have-been-fully-refunded">
                                    {translate("all_accounts_refunded")}
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
                        <p>{translate("read_only_mode")}</p>
                    </div>
                </div>
            </div>;
        }

        let welcome_screen = null;
        if (new_visitor && this.state.showBanner
                  && !/^\/ico$/.test(location.pathname) && !/^\/$/.test(location.pathname)  // LANDING
            ) {
            welcome_screen = (
                <div className="welcomeWrapper">
                    <div className="welcomeBanner">
                        <CloseButton onClick={() => this.setState({showBanner: false})} />
                        <div className="text-center">
                            <h2>{translate("welcome_to_the_blockchain")}</h2>
                            <h4>{translate("your_voice_is_worth_something")}</h4>
                            <br />
                            <a className="button" href="/create_account" onClick={showSignUp}> <b>{translate("sign_up")}</b> </a>
                            &nbsp; &nbsp; &nbsp;
                            <a className="button hollow uppercase" href={LANDING_PAGE_URL} target="_blank"> <b>{translate("learn_more")}</b> </a>
                            <br />
                            <br />
                            <div className="tag3">
                                <b>{translate("get_INVEST_TOKEN_when_sign_up", {signupBonus: localizedCurrency(signup_bonus)})}</b>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        let header_bar = null
        // if (!/^\/ico$/.test(location.pathname) && !/^\/$/.test(location.pathname)) {
        if (location.pathname.indexOf("/ico")) {
          header_bar = (
          <div>

          <SidePanel ref="side_panel" alignment="right">
              <TopRightMenu vertical navigate={this.navigate} />
              <ul className="vertical menu">
                  <li>
                      <a href={WIKI_URL} target="blank" onClick={this.navigate}>
                            {translate('wiki')}
                      </a>
                  </li>
                  <li>
                      <a href={LANDING_PAGE_URL} onClick={this.navigate}>
                          {translate("about")}
                      </a>
                  </li>
                  <li>
                      <a href="/tags.html/hot" onClick={this.navigate}>
                          {translate("explore")}
                      </a>
                  </li>
                  <li>
                      <a href={WHITEPAPER_URL} onClick={this.navigate}>
                          {translate("APP_NAME_whitepaper")}
                      </a>
                  </li>
                  {/* <li>
                      <a onClick={() => depositSteem()}>
                          {translate("buy_LIQUID_TOKEN")}
                      </a>
                  </li> */}
                  <li>
                      <a href="/market" onClick={this.navigate}>
                          {translate("market")}
                      </a>
                  </li>
                  <li>
                      <a href="/recover_account_step_1" onClick={this.navigate}>
                      {translate("stolen_account_recovery")}
                      </a>
                  </li>
                  <li>
                      <a href="/change_password" onClick={this.navigate}>
                          {translate("change_account_password")}
                      </a>
                  </li>
                  <li>
                      <a href="https://chat.golos.io" target="_blank">
                          {translate("APP_NAME_chat")}&nbsp;<Icon name="extlink" />
                      </a>
                  </li>
                  <li className="last">
                      <a href="/~witnesses" onClick={this.navigate}>
                          {translate("witnesses")}
                      </a>
                  </li>
              </ul>
              <ul className="vertical menu">
                  <li>
                      <a href={TERMS_OF_SERVICE_URL} onClick={this.navigate} rel="nofollow">
                          {translate("privacy_policy")}
                      </a>
                  </li>
                  <li>
                      <a href={PRIVACY_POLICY_URL} onClick={this.navigate} rel="nofollow">
                          {translate("terms_of_service")}
                      </a>
                  </li>
              </ul>
          </SidePanel>
          <Header toggleOffCanvasMenu={this.toggleOffCanvasMenu} menuOpen={this.state.open} /></div>);
        }
        else {
            header_bar = (
                <div>
                    <SidePanel ref="side_panel" alignment="right">
                        <TopRightMenu vertical navigate={this.navigate} />
                    </SidePanel>
                    <Header toggleOffCanvasMenu={this.toggleOffCanvasMenu} menuOpen={this.state.open} />
                </div>
            );
        }

        return <div className={'App' + (lp ? ' LP' : '') + (ip ? ' index-page' : '')} onMouseMove={this.onEntropyEvent}>
                {header_bar}
            <div className="App__content">
                {welcome_screen}
                {callout}
                {children}
                {lp ? <LpFooter /> : null}
            </div>
            <Dialogs />
            <Modals />
        </div>
    }
}

App.propTypes = {
    error: React.PropTypes.string,
    children: AppPropTypes.Children,
    location: React.PropTypes.object,
    signup_bonus: React.PropTypes.string,
    loading: React.PropTypes.bool,
    loginUser: React.PropTypes.func.isRequired,
    depositSteem: React.PropTypes.func.isRequired,
};

export default connect(
    state => {
        return {
            error: state.app.get('error'),
            flash: state.offchain.get('flash'),
            signup_bonus: state.offchain.get('signup_bonus'),
            loading: state.app.get('loading'),
            new_visitor: !state.user.get('current') &&
                !state.offchain.get('user') &&
                !state.offchain.get('account') &&
                state.offchain.get('new_visit')
        };
    },
    dispatch => ({
        loginUser: () =>
            dispatch(user.actions.usernamePasswordLogin()),
        showSignUp: e => {
            if (e) e.preventDefault();
            dispatch(user.actions.showSignUp());
        },
        depositSteem: () => {
            dispatch(g.actions.showDialog({name: 'blocktrades_deposit', params: {outputCoinType: VEST_TICKER}}));
        },
    })
)(App);
