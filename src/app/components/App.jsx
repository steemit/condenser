/* eslint-disable react/no-string-refs */
/* eslint-disable react/jsx-no-comment-textnodes */
/* eslint-disable no-constant-condition */
/* eslint-disable no-undef */
/* eslint-disable class-methods-use-this */
/* eslint-disable react/sort-comp */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import AppPropTypes from 'app/utils/AppPropTypes';
import Header from 'app/components/modules/Header';
import * as userActions from 'app/redux/UserReducer';
import * as appActions from 'app/redux/AppReducer';
import * as globalActions from 'app/redux/GlobalReducer';
import classNames from 'classnames';
import ConnectedSidePanel from 'app/components/modules/ConnectedSidePanel';
import CloseButton from 'app/components/elements/CloseButton';
import Dialogs from 'app/components/modules/Dialogs';
import Modals from 'app/components/modules/Modals';
import WelcomePanel from 'app/components/elements/WelcomePanel';
import tt from 'counterpart';
import PageViewsCounter from 'app/components/elements/PageViewsCounter';
import { VIEW_MODE_WHISTLE } from 'shared/constants';

class App extends React.Component {
    constructor(props) {
        super(props);
        // TODO: put both of these and associated toggles into Redux Store.
        this.state = {
            showCallout: true,
            showBanner: true,
        };
        this.listenerActive = null;
    }

    toggleBodyNightmode(nightmodeEnabled) {
        if (nightmodeEnabled) {
            document.body.classList.remove('theme-light');
            document.body.classList.add('theme-dark');
        } else {
            document.body.classList.remove('theme-dark');
            document.body.classList.add('theme-light');
        }
    }

    componentWillReceiveProps(nextProps) {
        const { nightmodeEnabled } = nextProps;
        this.toggleBodyNightmode(nightmodeEnabled);
    }

    componentWillMount() {
        if (process.env.BROWSER) localStorage.removeItem('autopost'); // July 14 '16 compromise, renamed to autopost2
        // make sure the autologin triggered each refresh page not each rendered progress.
        if (process.env.BROWSER && this.props.frontendHasRendered === false) {
            this.props.setFeRendered();
            this.props.loginUser();
        }
        if (!this.props.hasDGP) {
            this.props.getDGP();
        }
    }

    componentDidMount() {
        const { nightmodeEnabled } = this.props;
        this.toggleBodyNightmode(nightmodeEnabled);
    }

    shouldComponentUpdate(nextProps, nextState) {
        const {
            pathname,
            new_visitor,
            nightmodeEnabled,
            showAnnouncement,
        } = this.props;
        const n = nextProps;
        return (
            pathname !== n.pathname ||
            new_visitor !== n.new_visitor ||
            this.state.showBanner !== nextState.showBanner ||
            this.state.showCallout !== nextState.showCallout ||
            nightmodeEnabled !== n.nightmodeEnabled ||
            showAnnouncement !== n.showAnnouncement
        );
    }

    setShowBannerFalse = () => {
        this.setState({ showBanner: false });
    };

    handleScrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    render() {
        const {
            params,
            children,
            new_visitor,
            nightmodeEnabled,
            viewMode,
            pathname,
            category,
            order,
        } = this.props;

        const whistleView = viewMode === VIEW_MODE_WHISTLE;
        const headerHidden = whistleView;
        const params_keys = Object.keys(params);
        const ip =
            pathname === '/' ||
            (params_keys.length === 2 &&
                params_keys[0] === 'order' &&
                params_keys[1] === 'category');
        const alert = this.props.error;
        let callout = null;
        if (this.state.showCallout && alert) {
            callout = (
                <div className="App__announcement row">
                    <div className="column">
                        <div className={classNames('callout', { alert })}>
                            <CloseButton
                                onClick={() =>
                                    this.setState({ showCallout: false })
                                }
                            />
                            <p>{alert}</p>
                        </div>
                    </div>
                </div>
            );
        } else if (false && ip && this.state.showCallout) {
            callout = (
                <div className="App__announcement row">
                    <div className="column">
                        <div
                            className={classNames(
                                'callout success',
                                { alert },
                                { warning },
                                { success }
                            )}
                        >
                            <CloseButton
                                onClick={() =>
                                    this.setState({ showCallout: false })
                                }
                            />
                            <ul>
                                <li>
                                    /*<a href="https://steemit.com/steemit/@steemitblog/steemit-com-is-now-open-source">
                                        ...STORY TEXT...
                                    </a>*/
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            );
        }
        if ($STM_Config.read_only_mode && this.state.showCallout) {
            callout = (
                <div className="App__announcement row">
                    <div className="column">
                        <div
                            className={classNames(
                                'callout warning',
                                { alert },
                                { warning },
                                { success }
                            )}
                        >
                            <CloseButton
                                onClick={() =>
                                    this.setState({ showCallout: false })
                                }
                            />
                            <p>{tt('g.read_only_mode')}</p>
                        </div>
                    </div>
                </div>
            );
        }

        const themeClass = nightmodeEnabled ? ' theme-dark' : ' theme-light';

        return (
            <div
                className={classNames('App', themeClass, {
                    'index-page': ip,
                    'whistle-view': whistleView,
                    withAnnouncement: this.props.showAnnouncement,
                })}
                ref="App_root"
            >
                <ConnectedSidePanel alignment="right" />

                {headerHidden ? null : (
                    <Header
                        pathname={pathname}
                        category={category}
                        order={order}
                    />
                )}

                <div className="App__content">
                    {process.env.BROWSER &&
                    ip &&
                    new_visitor &&
                    this.state.showBanner ? (
                        <WelcomePanel
                            setShowBannerFalse={this.setShowBannerFalse}
                        />
                    ) : null}
                    {callout}
                    {children}
                    <button
                        onClick={this.handleScrollToTop}
                        className="scroll-to-top"
                        aria-label="Scroll to top"
                    >
                        &#8593;
                    </button>
                </div>
                <Dialogs />
                <Modals />
                <PageViewsCounter />
            </div>
        );
    }
}

App.propTypes = {
    error: PropTypes.string,
    children: AppPropTypes.Children,
    pathname: PropTypes.string,
    category: PropTypes.string,
    order: PropTypes.string,
    loginUser: PropTypes.func.isRequired,
};

export default connect(
    (state, ownProps) => {
        const current_user = state.user.get('current');
        const current_account_name = current_user
            ? current_user.get('username')
            : state.offchain.get('account');

        return {
            viewMode: state.app.get('viewMode'),
            error: state.app.get('error'),
            new_visitor:
                !state.user.get('current') &&
                !state.offchain.get('user') &&
                !state.offchain.get('account') &&
                state.offchain.get('new_visit'),

            nightmodeEnabled: state.app.getIn([
                'user_preferences',
                'nightmode',
            ]),
            pathname: ownProps.location.pathname,
            order: ownProps.params.order,
            category: ownProps.params.category,
            showAnnouncement: state.user.get('showAnnouncement'),
            hasDGP: state.global.has('dgp'),
            frontendHasRendered: state.app.get('frontend_has_rendered'),
        };
    },
    dispatch => ({
        loginUser: () => dispatch(userActions.usernamePasswordLogin({})),
        setFeRendered: () => dispatch(appActions.setFeRendered({})),
        getDGP: () => dispatch(globalActions.getDGP({})),
    })
)(App);
