import React, { Component } from 'react';
import tt from 'counterpart';
import { connect } from 'react-redux';
import * as userActions from 'app/redux/UserReducer';

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
            // this.props.hideTronCreate();
            // this.props.showTronCreateSuccess();
            this.props.updateUser();
        };
    }
    componentDidUpdate(prevProps) {
        // start to download pdf key file
        if (this.props.tron_create !== prevProps.tron_create) {
            this.props.hideTronCreate();
            this.props.showTronCreateSuccess();
        }
        if (this.props.tron_create_msg !== prevProps.tron_create_msg) {
            this.setState({
                err_msg: this.props.tron_create_msg,
                error: this.tron_create_msg == '' ? false : true,
            });
        }
    }

    render() {
        return (
            <div>
                <div>
                    <h3>{tt('tron_jsx.create_tron_account')}</h3>
                </div>
                {this.state.error == false ? (
                    <div style={styles.container}>
                        <p> {tt('tron_jsx.create_tron_account_content')} </p>
                        <p> {tt('tron_jsx.create_tron_account_content1')} </p>
                        <p> {tt('tron_jsx.create_tron_account_content2')} </p>
                    </div>
                ) : (
                    <div>
                        <p> {this.props.tron_create_msg} </p>
                        <p>
                            {' '}
                            Fail to create a tron account, click button and try
                            again
                        </p>
                    </div>
                )}
                <div style={styles.flowBelow}>
                    <button
                        type="submit"
                        className="button"
                        onClick={this.handleSubmit}
                    >
                        {tt('tron_jsx.create_tron_agree')}
                    </button>
                </div>
            </div>
        );
    }
}

export default connect(
    // mapStateToProps
    (state, ownProps) => {
        const currentUser = state.user.get('current');
        const tron_create =
            currentUser && currentUser.has('tron_create')
                ? currentUser.get('tron_create')
                : false;
        const tron_create_msg =
            currentUser && currentUser.has('tron_create_msg')
                ? currentUser.get('tron_create_msg')
                : '';
        return {
            ...ownProps,
            tron_create,
            tron_create_msg,
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
        updateUser: () => {
            dispatch(
                userActions.updateUser({
                    claim_reward: false,
                    tron_address: '',
                })
            );
        },
    })
)(TronCreateOne);
