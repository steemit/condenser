/* eslint-disable react/style-prop-object */
/* eslint-disable arrow-parens */
/* eslint-disable no-undef */
/* eslint-disable react/forbid-prop-types */
/* eslint-disable no-unused-vars */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import CloseButton from 'app/components/elements/CloseButton';
import Reveal from 'app/components/elements/Reveal';
import Icon from 'app/components/elements/Icon';
import { NotificationStack } from 'react-notification';
import tt from 'counterpart';
import * as userActions from 'app/redux/UserReducer';
import * as appActions from 'app/redux/AppReducer';
import * as transactionActions from 'app/redux/TransactionReducer';
import LoginForm from 'app/components/modules/LoginForm';
import ConfirmTransactionForm from 'app/components/modules/ConfirmTransactionForm';
import shouldComponentUpdate from 'app/utils/shouldComponentUpdate';
import TermsAgree from 'app/components/modules/TermsAgree';
import PostAdvancedSettings from 'app/components/modules/PostAdvancedSettings';
import PostDrafts from './PostDrafts';
import PostTemplates from './PostTemplates';

class Modals extends React.Component {
    static propTypes = {
        show_login_modal: PropTypes.bool,
        show_confirm_modal: PropTypes.bool,
        show_bandwidth_error_modal: PropTypes.bool,
        show_promote_post_modal: PropTypes.bool,
        show_post_advanced_settings_modal: PropTypes.string,
        show_post_drafts_modal: PropTypes.string,
        on_post_drafts_close_modal: PropTypes.func,
        clear_draft_modal: PropTypes.func,
        show_post_templates_modal: PropTypes.string,
        on_post_templates_close_modal: PropTypes.func,
        hideLogin: PropTypes.func.isRequired,
        username: PropTypes.string,
        hideConfirm: PropTypes.func.isRequired,
        hidePromotePost: PropTypes.func.isRequired,
        hideBandwidthError: PropTypes.func.isRequired,
        hidePostAdvancedSettings: PropTypes.func.isRequired,
        hidePostDrafts: PropTypes.func.isRequired,
        hidePostTemplates: PropTypes.func.isRequired,
        notifications: PropTypes.object,
        show_terms_modal: PropTypes.bool,
        removeNotification: PropTypes.func,
        loginBroadcastOperation: PropTypes.shape({
            type: PropTypes.string,
            username: PropTypes.string,
            successCallback: PropTypes.func,
            errorCallback: PropTypes.func,
        }),
        loading: PropTypes.bool,
        show_image_viewer_modal: PropTypes.bool,
        image_viewer_url: PropTypes.string,
        hideImageViewer: PropTypes.func,
    };

    static defaultProps = {
        username: '',
        notifications: undefined,
        removeNotification: () => {},
        show_terms_modal: false,
        show_promote_post_modal: false,
        show_bandwidth_error_modal: false,
        show_confirm_modal: false,
        show_login_modal: false,
        show_post_advanced_settings_modal: '',
        show_post_drafts_modal: '',
        on_post_drafts_close_modal: () => {},
        clear_draft_modal: () => {},
        show_post_templates_modal: '',
        on_post_templates_close_modal: () => {},
        loginBroadcastOperation: undefined,
        loading: false,
        show_image_viewer_modal: false,
        image_viewer_url: '',
        hideImageViewer: () => {},
        imageZoomed: false,
    };

    constructor() {
        super();
        this.wheelRef = null;
        this.preventDefault = e => e.preventDefault();
        this.state = {
            imageZoomed: false,
            zoomLevel: 1,
        };
        this.shouldComponentUpdate = shouldComponentUpdate(this, 'Modals');
    }

    componentWillUnmount() {
        if (this.wheelRef && this.preventDefault) {
            this.wheelRef.removeEventListener('wheel', this.preventDefault);
        }
    }

    setContainerDimensions = () => {
        const img = this.zoomImg;
        const revealEl = img.closest('.reveal');

        if (!img || !revealEl) return;

        const naturalWidth = img.naturalWidth;
        const naturalHeight = img.naturalHeight;
        const windowWidth = window.innerWidth * 0.75;
        const windowHeight = window.innerHeight * 0.9;

        const widthRatio = windowWidth / naturalWidth;
        const heightRatio = windowHeight / naturalHeight;
        const scaleRatio = Math.min(widthRatio, heightRatio);

        const scaledWidth = naturalWidth * scaleRatio;
        const scaledHeight = naturalHeight * scaleRatio;
        const controlsEl = revealEl.querySelector('.modalImageOptions');
        const controlsHeight = controlsEl ? controlsEl.offsetHeight : 0;
        const adjustedHeight = naturalHeight * scaleRatio + controlsHeight;

        this.setState({
            originalheight: scaledHeight,
            originalwidth: scaledWidth,
            zoomLevel: 1,
            imageZoomed: false,
        });

        revealEl.style.setProperty('--onload-width', `${scaledWidth}px`);
        revealEl.style.setProperty('--onload-height', `${adjustedHeight}px`);

        this.wheelRef.addEventListener('wheel', this.preventDefault);
    };

    handleZoomIn = () => {
        const img = this.zoomImg;
        const originalHeight = this.state.originalheight;
        const originalWidth = this.state.originalwidth;

        const container = img.closest('.modalImageContainer');
        if (!img || !container) return;

        const { scrollLeft, scrollTop, clientWidth, clientHeight } = container;

        const viewCenterX = scrollLeft + clientWidth / 2;
        const viewCenterY = scrollTop + clientHeight / 2;

        const currentZoom = this.state.zoomLevel || 1;
        const relativeX = viewCenterX / (originalWidth * currentZoom);
        const relativeY = viewCenterY / (originalHeight * currentZoom);

        if (!img.classList.contains('zoomed')) {
            img.classList.add('zoomed');
            this.setState({ imageZoomed: true });
        }

        this.setState(
            prevState => ({
                zoomLevel: prevState.zoomLevel + 0.5,
            }),
            () => {
                const newZoom = this.state.zoomLevel;
                const zoomedWidth = originalWidth * newZoom;
                const zoomedHeight = originalHeight * newZoom;

                img.style.setProperty('--original-height', originalHeight);
                img.style.setProperty('--original-width', originalWidth);
                img.style.setProperty('--zoom-level', newZoom);
                container.style.setProperty(
                    '--original-height',
                    originalHeight
                );

                const newScrollLeft = zoomedWidth * relativeX - clientWidth / 2;
                const newScrollTop =
                    zoomedHeight * relativeY - clientHeight / 2;

                container.scrollLeft = newScrollLeft;
                container.scrollTop = newScrollTop;
            }
        );
    };

    handleZoomOut = () => {
        const img = this.zoomImg;
        const originalHeight = this.state.originalheight;
        const originalWidth = this.state.originalwidth;

        const container = img.closest('.modalImageContainer');
        if (!img || !container) return;

        const { scrollLeft, scrollTop, clientWidth, clientHeight } = container;

        const viewCenterX = scrollLeft + clientWidth / 2;
        const viewCenterY = scrollTop + clientHeight / 2;

        const currentZoom = this.state.zoomLevel || 1;
        const relativeX = viewCenterX / (originalWidth * currentZoom);
        const relativeY = viewCenterY / (originalHeight * currentZoom);

        this.setState(prevState => {
            const newZoomLevel =
                prevState.zoomLevel > 1
                    ? prevState.zoomLevel - 0.5
                    : prevState.zoomLevel;

            img.style.setProperty('--zoom-level', newZoomLevel);

            if (newZoomLevel === 1) {
                img.classList.remove('zoomed');
                this.setState({ imageZoomed: false });
            }

            const zoomedWidth = originalWidth * newZoomLevel;
            const zoomedHeight = originalHeight * newZoomLevel;

            const newScrollLeft = zoomedWidth * relativeX - clientWidth / 2;
            const newScrollTop = zoomedHeight * relativeY - clientHeight / 2;

            container.scrollLeft = newScrollLeft;
            container.scrollTop = newScrollTop;

            return { zoomLevel: newZoomLevel };
        });
    };

    handleResetZoom = () => {
        this.setState({ zoomLevel: 1, imageZoomed: false });
        if (this.zoomImg) {
            this.zoomImg.classList.remove('zoomed');
            this.zoomImg.style.setProperty('--zoom-level', 1);
        }
    };

    onMouseWheel = e => {
        e.stopPropagation();
        if (e.deltaY < 0) {
            this.handleZoomIn();
        } else if (e.deltaY > 0) {
            this.handleZoomOut();
        }
    };

    handleDragOrTouchStart = e => {
        const isTouchEvent = e.type === 'touchstart';
        const pageX = isTouchEvent ? e.touches[0].pageX : e.pageX;
        const pageY = isTouchEvent ? e.touches[0].pageY : e.pageY;

        this.isDragging = true;
        this.dragStartX = pageX - this.imageContainer.offsetLeft;
        this.dragStartY = pageY - this.imageContainer.offsetTop;
        this.scrollLeft = this.imageContainer.scrollLeft;
        this.scrollTop = this.imageContainer.scrollTop;
    };

    handleDragOrTouchMove = e => {
        if (!this.isDragging) return;

        e.preventDefault();

        const isTouchEvent = e.type === 'touchmove';
        const pageX = isTouchEvent ? e.touches[0].pageX : e.pageX;
        const pageY = isTouchEvent ? e.touches[0].pageY : e.pageY;

        const x = pageX - this.imageContainer.offsetLeft;
        const y = pageY - this.imageContainer.offsetTop;
        const walkX = (x - this.dragStartX) * 1;
        const walkY = (y - this.dragStartY) * 1;

        this.imageContainer.scrollLeft = this.scrollLeft - walkX;
        this.imageContainer.scrollTop = this.scrollTop - walkY;
    };

    handleDragOrTouchEnd = () => {
        this.isDragging = false;
    };

    render() {
        const {
            show_login_modal,
            show_confirm_modal,
            show_bandwidth_error_modal,
            show_post_advanced_settings_modal,
            show_post_drafts_modal,
            on_post_drafts_close_modal,
            clear_draft_modal,
            show_post_templates_modal,
            on_post_templates_close_modal,
            hideLogin,
            hideConfirm,
            show_terms_modal,
            notifications,
            removeNotification,
            hidePromotePost,
            show_promote_post_modal,
            hideBandwidthError,
            hidePostAdvancedSettings,
            hidePostDrafts,
            hidePostTemplates,
            username,
            loginBroadcastOperation,
            show_image_viewer_modal,
            image_viewer_url,
            hideImageViewer,
        } = this.props;

        const notifications_array = notifications
            ? notifications.toArray().map(n => {
                  n.onClick = () => removeNotification(n.key);
                  return n;
              })
            : [];

        const buySteemPower = e => {
            if (e && e.preventDefault) e.preventDefault();
            const new_window = window.open();
            new_window.opener = null;
            new_window.location = 'https://poloniex.com/exchange#trx_steem';
        };
        return (
            <div>
                {show_login_modal && (
                    <Reveal
                        onHide={() => {
                            hideLogin();
                        }}
                        show={show_login_modal}
                    >
                        <CloseButton onClick={() => hideLogin()} />
                        <LoginForm onCancel={hideLogin} />
                    </Reveal>
                )}
                {show_confirm_modal && (
                    <Reveal onHide={hideConfirm} show={show_confirm_modal}>
                        <CloseButton onClick={hideConfirm} />
                        <ConfirmTransactionForm onCancel={hideConfirm} />
                    </Reveal>
                )}
                {show_terms_modal && (
                    <Reveal show={show_terms_modal}>
                        <TermsAgree onCancel={hideLogin} />
                    </Reveal>
                )}
                {show_bandwidth_error_modal && (
                    <Reveal
                        onHide={hideBandwidthError}
                        show={show_bandwidth_error_modal}
                    >
                        <div>
                            <CloseButton onClick={hideBandwidthError} />
                            <h4>{tt('modals_jsx.your_transaction_failed')}</h4>
                            <hr />
                            <h5>{tt('modals_jsx.out_of_bandwidth_title')}</h5>
                            <p>{tt('modals_jsx.out_of_bandwidth_reason')}</p>
                            <p>{tt('modals_jsx.out_of_bandwidth_reason_2')}</p>
                            <p>
                                {tt('modals_jsx.out_of_bandwidth_option_title')}
                            </p>
                            <ol>
                                <li>
                                    {tt('modals_jsx.out_of_bandwidth_option_4')}
                                </li>
                                <li>
                                    {tt('modals_jsx.out_of_bandwidth_option_1')}
                                </li>
                                <li>
                                    {tt('modals_jsx.out_of_bandwidth_option_2')}
                                </li>
                                <li>
                                    {tt('modals_jsx.out_of_bandwidth_option_3')}
                                </li>
                            </ol>
                            <button className="button" onClick={buySteemPower}>
                                {tt('g.buy_steem_power')}
                            </button>
                        </div>
                    </Reveal>
                )}
                {show_post_advanced_settings_modal && (
                    <Reveal
                        onHide={hidePostAdvancedSettings}
                        show={show_post_advanced_settings_modal ? true : false}
                    >
                        <CloseButton onClick={hidePostAdvancedSettings} />
                        <PostAdvancedSettings
                            formId={show_post_advanced_settings_modal}
                        />
                    </Reveal>
                )}
                {show_post_drafts_modal && (
                    <Reveal
                        onHide={hidePostDrafts}
                        show={show_post_drafts_modal ? true : false}
                    >
                        <CloseButton onClick={hidePostDrafts} />
                        <PostDrafts
                            formId={show_post_drafts_modal}
                            onDraftsClose={on_post_drafts_close_modal}
                            clearDraft={clear_draft_modal}
                        />
                    </Reveal>
                )}
                {show_post_templates_modal && (
                    <Reveal
                        onHide={hidePostTemplates}
                        show={show_post_templates_modal ? true : false}
                    >
                        <CloseButton onClick={hidePostTemplates} />
                        <PostTemplates
                            formId={show_post_templates_modal}
                            onTemplatesClose={on_post_templates_close_modal}
                        />
                    </Reveal>
                )}
                {show_image_viewer_modal && (
                    <Reveal
                        onHide={hideImageViewer}
                        show={show_image_viewer_modal ? true : false}
                    >
                        <CloseButton
                            onClick={() => {
                                this.handleResetZoom();
                                hideImageViewer();
                            }}
                        />
                        <div
                            className="modalImageContainer"
                            ref={el => {
                                this.imageContainer = el;
                                this.wheelRef = el;
                            }}
                            onMouseDown={this.handleDragOrTouchStart}
                            onMouseMove={this.handleDragOrTouchMove}
                            onMouseUp={this.handleDragOrTouchEnd}
                            onMouseLeave={this.handleDragOrTouchEnd}
                            onWheel={this.onMouseWheel}
                            onTouchStart={this.handleDragOrTouchStart}
                            onTouchMove={this.handleDragOrTouchMove}
                            onTouchEnd={this.handleDragOrTouchEnd}
                            onLoad={this.setContainerDimensions}
                            role="button"
                            tabIndex="0"
                        >
                            <center>
                                <img
                                    src={image_viewer_url}
                                    alt="overlay"
                                    className="modalImage"
                                    onMouseDown={this.handleMouseDown}
                                    onDragStart={e => e.preventDefault()}
                                    style={{
                                        cursor: this.state.imageZoomed
                                            ? 'grab'
                                            : 'default',
                                    }}
                                    ref={el => (this.zoomImg = el)}
                                    role="button"
                                    tabIndex="0"
                                />
                            </center>
                        </div>
                        <div className="modalImageOptions">
                            <span
                                className="modalImageZoomOut"
                                onClick={this.handleZoomOut}
                                role="button"
                                tabIndex="0"
                            >
                                <Icon name="zoom-out" size="2x" />
                            </span>
                            <span
                                className="modalImageResetZoom"
                                onClick={this.handleResetZoom}
                                role="button"
                                tabIndex="0"
                            >
                                <Icon name="zoom-reset" size="2x" />
                            </span>
                            <span
                                className="modalImageZoomIn"
                                onClick={this.handleZoomIn}
                                role="button"
                                tabIndex="0"
                            >
                                <Icon name="zoom-in" size="2x" />
                            </span>
                        </div>
                    </Reveal>
                )}
                <NotificationStack
                    style={false}
                    notifications={notifications_array}
                    onDismiss={n => removeNotification(n.key)}
                />
            </div>
        );
    }
}

export default connect(
    state => {
        const rcErr = state.transaction.getIn(['errors', 'bandwidthError']);
        // get the onErrorCB and call it on cancel
        const show_login_modal = state.user.get('show_login_modal');
        let loginBroadcastOperation = {};
        if (
            show_login_modal &&
            state.user &&
            state.user.getIn(['loginBroadcastOperation'])
        ) {
            loginBroadcastOperation = state.user
                .getIn(['loginBroadcastOperation'])
                .toJS();
        }

        return {
            username: state.user.getIn(['current', 'username']),
            show_login_modal,
            show_confirm_modal: state.transaction.get('show_confirm_modal'),
            show_promote_post_modal: state.user.get('show_promote_post_modal'),
            notifications: state.app.get('notifications'),
            show_terms_modal:
                state.user.get('show_terms_modal') &&
                state.routing.locationBeforeTransitions.pathname !==
                    '/tos.html' &&
                state.routing.locationBeforeTransitions.pathname !==
                    '/privacy.html',
            show_bandwidth_error_modal: rcErr,
            show_post_advanced_settings_modal: state.user.get(
                'show_post_advanced_settings_modal'
            ),
            show_post_drafts_modal: state.user.get('show_post_drafts_modal'),
            on_post_drafts_close_modal: state.user.get(
                'on_post_drafts_close_modal'
            ),
            clear_draft_modal: state.user.get('clear_draft_modal'),
            show_post_templates_modal: state.user.get(
                'show_post_templates_modal'
            ),
            on_post_templates_close_modal: state.user.get(
                'on_post_templates_close_modal'
            ),
            loginBroadcastOperation,
            loading: state.app.get('modalLoading'),
            show_image_viewer_modal:
                state.user.get('show_image_viewer') || false,
            image_viewer_url: state.user.get('image_viewer_url') || '',
        };
    },
    dispatch => ({
        hideLogin: e => {
            if (e) e.preventDefault();
            dispatch(userActions.hideLogin());
        },
        hideConfirm: e => {
            if (e) e.preventDefault();
            dispatch(transactionActions.hideConfirm());
        },
        hidePromotePost: e => {
            if (e) e.preventDefault();
            dispatch(userActions.hidePromotePost());
        },
        hideBandwidthError: e => {
            if (e) e.preventDefault();
            dispatch(
                transactionActions.dismissError({ key: 'bandwidthError' })
            );
        },
        hidePostAdvancedSettings: e => {
            if (e) e.preventDefault();
            dispatch(userActions.hidePostAdvancedSettings());
        },
        hidePostDrafts: e => {
            if (e) e.preventDefault();
            dispatch(userActions.hidePostDrafts());
        },
        hidePostTemplates: e => {
            if (e) e.preventDefault();
            dispatch(userActions.hidePostTemplates());
        },
        // example: addNotification: ({key, message}) => dispatch({type: 'ADD_NOTIFICATION', payload: {key, message}}),
        removeNotification: key =>
            dispatch(appActions.removeNotification({ key })),
        hideImageViewer: e => {
            if (e) e.preventDefault();
            dispatch(userActions.hideImageViewer());
        },
    })
)(Modals);
