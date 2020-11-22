import React, { Component } from 'react';
import tt from 'counterpart';
import { connect } from 'react-redux';
import * as userActions from 'app/redux/UserReducer';
import * as appActions from 'app/redux/AppReducer';
import LoadingIndicator from 'app/components/elements/LoadingIndicator';

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'row',
        flexFlow: 'row wrap',
        marginTop: '40px',
    },
    flowBelow: {
        marginTop: '40px',
    },
};

class TronCreateOne extends Component {
    constructor() {
        super();
        this.state = {
            error_msg: '',
            error: false,
        };
        this.handleSubmit = e => {
            e.preventDefault();
            this.props.setTronErrMsg(null);
            this.props.startLoading();
            this.props.updateTronAddr();
        };
    }

    componentWillUpdate(nextProps) {
        const {
            tronPrivateKey,
            showTronCreateSuccess,
            hideTronCreate,
            tronErrMsg,
        } = nextProps;
        if (tronPrivateKey) {
            this.props.endLoading();
            showTronCreateSuccess();
            hideTronCreate();
        }
        if (tronErrMsg) {
            this.props.endLoading();
        }
    }

    componentWillUnmount() {
        this.props.setTronErrMsg(null);
    }

    render() {
        return (
            <div>
                <div>
                    <h3>{tt('tron_jsx.create_tron_account')}</h3>
                </div>
                <div style={styles.container}>
                    <p> {tt('tron_jsx.create_tron_account_content')} </p>
                    <p> {tt('tron_jsx.create_tron_account_content1')} </p>
                    <p> {tt('tron_jsx.create_tron_account_content2')} </p>
                </div>
                <div style={styles.flowBelow}>
                    <button
                        type="submit"
                        className="button"
                        onClick={this.handleSubmit}
                        disabled={this.props.loading}
                    >
                        {tt('tron_jsx.create_tron_agree')}
                    </button>
                    {this.props.loading && (
                        <span>
                            <LoadingIndicator type="circle" />
                        </span>
                    )}
                    {this.props.tronErrMsg && (
                        <span
                            style={{
                                display: 'block',
                                color: 'red',
                            }}
                        >
                            {this.props.tronErrMsg}
                        </span>
                    )}
                </div>
            </div>
        );
    }
}

export default connect(
    // mapStateToProps
    (state, ownProps) => {
        const currentUser = state.user.get('current');
        const tronPrivateKey =
            currentUser && currentUser.has('tron_private_key')
                ? currentUser.get('tron_private_key')
                : '';
        const tronErrMsg = state.app.has('tronErrMsg')
            ? state.app.get('tronErrMsg')
            : null;
        return {
            ...ownProps,
            loading: state.app.get('modalLoading'),
            tronPrivateKey,
            tronErrMsg,
        };
    },
    dispatch => ({
        hideTronCreate: () => {
            // if (e) e.preventDefault();
            dispatch(userActions.hideTronCreate());
        },
        showTronCreateSuccess: () => {
            dispatch(userActions.showTronCreateSuccess());
        },
        updateTronAddr: () => {
            dispatch(userActions.updateTronAddr());
        },
        startLoading: () => {
            dispatch(appActions.modalLoadingBegin());
        },
        endLoading: () => {
            dispatch(appActions.modalLoadingEnd());
        },
        setTronErrMsg: msg => {
            dispatch(appActions.setTronErrMsg(msg));
        },
    })
)(TronCreateOne);
