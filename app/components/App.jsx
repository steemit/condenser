import React from 'react';
import {connect} from 'react-redux';
import AppPropTypes from 'app/utils/AppPropTypes';
import Header from 'app/components/modules/Header';
import LpFooter from 'app/components/modules/lp/LpFooter';
import user from 'app/redux/User';
import g from 'app/redux/GlobalReducer';
import { Link } from 'react-router';
import TopRightMenu from 'app/components/modules/TopRightMenu';
import { browserHistory } from 'react-router';
import classNames from 'classnames';
import SidePanel from 'app/components/modules/SidePanel';
import CloseButton from 'react-foundation-components/lib/global/close-button';
import Dialogs from 'app/components/modules/Dialogs';
import Modals from 'app/components/modules/Modals';
import Icon from 'app/components/elements/Icon';
import {key_utils} from 'shared/ecc'

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
                                    Steemit.com is now Open Source
                                </a>
                            </li>
                            <li>
                                <a href="https://steemit.com/steemit/@steemitblog/all-recovered-accounts-have-been-fully-refunded">
                                    All Recovered Accounts have been fully Refunded
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
                        <p>Due to server maintenance we are running in read only mode.  We are sorry for the inconvenience.</p>
                    </div>
                </div>
            </div>;
        }

        let welcome_screen = null;
        if (new_visitor && this.state.showBanner) {
            welcome_screen = (
                <div className="welcomeWrapper">
                    <div className="welcomeBanner">
                        <CloseButton onClick={() => this.setState({showBanner: false})} />
                        <div className="text-center">
                            <h2>Welcome to the Blockchain!</h2>
                            <h4>Your voice is worth something</h4>
                            <br />
                            <a className="button" href="/create_account" onClick={showSignUp}> <b>SIGN UP</b> </a>
                            &nbsp; &nbsp; &nbsp;
                            <a className="button hollow" href="https://steem.io" target="_blank"> <b>LEARN MORE</b> </a>
                            <br />
                            <br />
                            <div className="tag3">
                                <b>Get {signup_bonus} of Steem Power when you sign up today.</b>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return <div className={'App' + (lp ? ' LP' : '') + (ip ? ' index-page' : '')} onMouseMove={this.onEntropyEvent}>
            <SidePanel ref="side_panel" alignment="right">
                <TopRightMenu vertical navigate={this.navigate} />
                <ul className="vertical menu">
                    <li><a href="https://steem.io" onClick={this.navigate}>About</a></li>
                    <li><a href="/tags.html/hot" onClick={this.navigate}>Explore</a></li>
                    <li><a href="https://steem.io/SteemWhitePaper.pdf" onClick={this.navigate}>Steem Whitepaper</a></li>
                    <li><a onClick={() => depositSteem()}>Buy Steem</a></li>
                    <li><a href="/market" onClick={this.navigate}>Market</a></li>
                    <li><a href="http://steemtools.com/" onClick={this.navigate}>Steem App Center</a></li>
                    <li><a href="/recover_account_step_1" onClick={this.navigate}>Stolen Account Recovery</a></li>
                    <li><a href="/change_password" onClick={this.navigate}>Change Account Password</a></li>
                    <li><a href="https://steemit.chat/home" target="_blank">Steemit Chat&nbsp;<Icon name="extlink"/></a></li>
                    <li className="last"><a onClick={this.navigate} href="/~witnesses">Witnesses</a></li>
                    <li className="last"><a onClick={this.navigate} href="/@steemitjobs">Careers</a></li>
                </ul>
                <ul className="vertical menu">
                    <li><a href="/privacy.html" onClick={this.navigate} rel="nofollow">Privacy Policy</a></li>
                    <li><a href="/tos.html" onClick={this.navigate} rel="nofollow">Terms of Service</a></li>
                </ul>
            </SidePanel>
            <Header toggleOffCanvasMenu={this.toggleOffCanvasMenu} menuOpen={this.state.open} />
            <div className="App__content">
                {welcome_screen}
                {callout}
                {children}
                {lp ? <LpFooter /> : null}
            </div>
            <Dialogs />
            <Modals />
        </div>;
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
            dispatch(g.actions.showDialog({name: 'blocktrades_deposit', params: {outputCoinType: 'VESTS'}}));
        },
    })
)(App);
