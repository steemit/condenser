import React, { Component } from 'react';
import tt from 'counterpart';
import { connect } from 'react-redux';
import * as userActions from 'app/redux/UserReducer';
import PdfDownload from 'app/components/elements/PdfDownload';

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        marginTop: '40px',
        width: '100%',
    },
    flowBelow: {
        marginTop: '40px',
    },
};

class TronCreateTwo extends Component {
    constructor() {
        super();
        this.state = {};
        this.handleSubmit = e => {
            e.preventDefault();
            this.props.hideTronCreateSuccess();
        };
    }

    render() {
        const { username, tronAddr, tronPrivateKey } = this.props;
        return (
            <div>
                <div>
                    <h3>{tt('tron_jsx.create_tron_success')}</h3>
                </div>
                <div style={styles.container}>
                    <div>{tt('tron_jsx.create_tron_success_content')}</div>
                    <div className="tron-account-dl">
                        <span>
                            {tt('tron_jsx.create_tron_success_content2')}
                        </span>
                        <PdfDownload
                            filename={`TRON account for @${username}`}
                            name={username}
                            tron_public_key={tronAddr}
                            tron_private_key={tronPrivateKey}
                            newUser={false}
                            widthInches={8.5}
                            heightInches={11.0}
                            label={tt('tron_jsx.update_success_click')}
                            link={true}
                            download={!!tronPrivateKey}
                            style={{
                                marginTop: 0,
                                marginBottom: 0,
                            }}
                        />
                        <span>
                            {tt('tron_jsx.create_tron_success_content3')}
                        </span>
                    </div>
                    <div>{tt('tron_jsx.update_success_content2')}</div>
                </div>
                <div style={styles.flowBelow}>
                    <button
                        type="submit"
                        className="button"
                        onClick={this.handleSubmit}
                    >
                        {tt('tron_jsx.safe_save_button')}
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
        const tronAddr =
            currentUser && currentUser.has('tron_addr')
                ? currentUser.get('tron_addr')
                : '';
        const username =
            currentUser && currentUser.has('username')
                ? currentUser.get('username')
                : '';
        const tronPrivateKey =
            currentUser && currentUser.has('tron_private_key')
                ? currentUser.get('tron_private_key')
                : '';
        return {
            ...ownProps,
            tronAddr,
            username,
            tronPrivateKey,
        };
    },
    dispatch => ({
        hideTronCreateSuccess: () => {
            dispatch(userActions.hideTronCreateSuccess());
        },
    })
)(TronCreateTwo);
