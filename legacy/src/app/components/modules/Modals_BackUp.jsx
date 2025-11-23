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
import { NotificationStack } from 'react-notification';
import { OrderedSet } from 'immutable';
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
        this.state = {
            imageZoomed: false,
            zoomLevel: 1,
        };
        this.shouldComponentUpdate = shouldComponentUpdate(this, 'Modals');
    }

    handleZoomIn = () => {
        const img = this.zoomImg;
        if (!img.classList.contains('zoomed')) {
            img.classList.add('zoomed');
            this.setState({ imageZoomed: true });
        }
        this.setState(prevState => {
            const newZoomLevel = prevState.zoomLevel + 0.5;
            this.zoomImg.style.setProperty('--zoom-level', newZoomLevel);
            console.log('Zoom Level: ', newZoomLevel);
            return { zoomLevel: newZoomLevel };
        });
    };

    handleZoomOut = () => {
        const img = this.zoomImg;
        this.setState(prevState => {
            const newZoomLevel =
                prevState.zoomLevel > 1
                    ? prevState.zoomLevel - 0.5
                    : prevState.zoomLevel;
            this.zoomImg.style.setProperty('--zoom-level', newZoomLevel);
            if (newZoomLevel == 1) {
                img.classList.remove('zoomed');
                this.setState({ imageZoomed: false });
            }
            console.log('Zoom Level: ', newZoomLevel);
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

    handleDragStart = e => {
        if (!this.state.imageZoomed) return;

        this.isDragging = true;
        this.dragStartX = e.pageX - this.imageContainer.offsetLeft;
        this.dragStartY = e.pageY - this.imageContainer.offsetTop;
        this.scrollLeft = this.imageContainer.scrollLeft;
        this.scrollTop = this.imageContainer.scrollTop;
    };

    handleDragMove = e => {
        if (!this.isDragging || !this.state.imageZoomed) return;

        e.preventDefault();
        const x = e.pageX - this.imageContainer.offsetLeft;
        const y = e.pageY - this.imageContainer.offsetTop;
        const walkX = (x - this.dragStartX) * 1; // scroll speed
        const walkY = (y - this.dragStartY) * 1;

        this.imageContainer.scrollLeft = this.scrollLeft - walkX;
        this.imageContainer.scrollTop = this.scrollTop - walkY;
    };

    handleDragEnd = () => {
        this.isDragging = false;
    };

    handleTouchStart = e => {
        if (!this.state.imageZoomed || e.touches.length !== 1) return;
        const touch = e.touches[0];
        this.isDragging = true;
        this.dragStartX = touch.pageX - this.imageContainer.offsetLeft;
        this.dragStartY = touch.pageY - this.imageContainer.offsetTop;
        this.scrollLeft = this.imageContainer.scrollLeft;
        this.scrollTop = this.imageContainer.scrollTop;
    };

    handleTouchMove = e => {
        if (!this.isDragging || !this.state.imageZoomed) return;

        const touch = e.touches[0];
        const x = touch.pageX - this.imageContainer.offsetLeft;
        const y = touch.pageY - this.imageContainer.offsetTop;
        const walkX = (x - this.dragStartX) * 1;
        const walkY = (y - this.dragStartY) * 1;

        this.imageContainer.scrollLeft = this.scrollLeft - walkX;
        this.imageContainer.scrollTop = this.scrollTop - walkY;
    };

    handleTouchEnd = () => {
        this.isDragging = false;
    };

    handleImageClick = () => {
        const img = this.zoomImg;
        const { imageZoomed } = this.state;

        if (!img) return;

        if (imageZoomed) {
            img.classList.remove('zoomed');
            this.setState({ zoomLevel: 1 });
            this.zoomImg.style.setProperty('--zoom-level', 1);
        } else {
            img.classList.add('zoomed');
            this.setState({ zoomLevel: 2 });
            this.zoomImg.style.setProperty('--zoom-level', 2);
        }

        this.setState({ imageZoomed: !imageZoomed });
    };

    handleImageMouseMove = e => {
        const img = this.zoomImg;
        if (!img || !this.state.imageZoomed) return;

        const rect = img.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width * 100;
        const y = (e.clientY - rect.top) / rect.height * 100;

        img.style.transformOrigin = `${x}% ${y}%`;
    };

    handleImageTouchMove = e => {
        const img = this.zoomImg;
        if (!img || !this.state.imageZoomed) return;

        // Ensure there's at least one touch point
        if (e.touches.length > 0) {
            const rect = img.getBoundingClientRect();
            const touch = e.touches[0]; // Get the first touch point
            const x = (touch.clientX - rect.left) / rect.width * 100;
            const y = (touch.clientY - rect.top) / rect.height * 100;

            // Adjust the transform-origin based on touch position
            img.style.transformOrigin = `${x}% ${y}%`;

            // Prevent default scrolling behavior
            e.preventDefault();
        }
    };

    resetZoom = () => {
        const img = this.zoomImg;
        if (img) {
            img.classList.remove('zoomed');
            this.setState({ zoomLevel: 1 });
            this.zoomImg.style.setProperty('--zoom-level', 1);
        }
        this.setState({ imageZoomed: false });
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
                        <div className="modalImageOptions">
                            <button
                                className="modalImageZoomIn"
                                onClick={this.handleZoomIn}
                                alt="Zoom In"
                            >
                                <i className="fa fa-search-plus" />
                            </button>
                            <button
                                className="modalImageZoomOut"
                                onClick={this.handleZoomOut}
                                alt="Zoome Out"
                            >
                                <i className="fa fa-search-minus" />
                            </button>
                            <button
                                className="modalImageResetZoom"
                                onClick={this.handleResetZoom}
                                alt="Reset Zoom"
                            >
                                <i className="fa fa-refresh" />
                            </button>
                            <CloseButton
                                className="modalImageCloseButton"
                                onClick={() => {
                                    this.resetZoom();
                                    hideImageViewer();
                                }}
                            />
                        </div>
                        <div
                            className="modalImageContainer"
                            ref={el => (this.imageContainer = el)}
                            onMouseDown={this.handleDragStart}
                            onMouseMove={this.handleDragMove}
                            onMouseUp={this.handleDragEnd}
                            onMouseLeave={this.handleDragEnd}
                            onTouchStart={this.handleTouchStart}
                            onTouchMove={this.handleTouchMove}
                            onTouchEnd={this.handleTouchEnd}
                        >
                            <center>
                                <img
                                    src={image_viewer_url}
                                    alt="overlay"
                                    className="modalImage"
                                    //onClick={this.handleImageClick}
                                    //onMouseMove={this.handleImageMouseMove}
                                    //onTouchMove={this.handleImageTouchMove} // Add touchmove event
                                    //role="button"
                                    //tabIndex="0"
                                    onMouseDown={this.handleMouseDown}
                                    onDragStart={e => e.preventDefault()}
                                    style={{
                                        cursor: this.state.imageZoomed
                                            ? 'grab'
                                            : 'default',
                                    }}
                                    ref={el => (this.zoomImg = el)}
                                />
                            </center>
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
