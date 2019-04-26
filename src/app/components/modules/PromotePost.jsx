import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import ReactDOM from 'react-dom';
import * as transactionActions from 'app/redux/TransactionReducer';
import * as globalActions from 'app/redux/GlobalReducer';
import LoadingIndicator from 'app/components/elements/LoadingIndicator';
import {
    DEBT_TOKEN,
    DEBT_TOKEN_SHORT,
    CURRENCY_SIGN,
    DEBT_TICKER,
} from 'app/client_config';
import tt from 'counterpart';

class PromotePost extends Component {
    static propTypes = {
        author: PropTypes.string.isRequired,
        permlink: PropTypes.string.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            amount: '1.0',
            asset: '',
            loading: false,
            amountError: '',
            trxError: '',
        };
        this.onSubmit = this.onSubmit.bind(this);
        this.errorCallback = this.errorCallback.bind(this);
        this.amountChange = this.amountChange.bind(this);
        // this.assetChange = this.assetChange.bind(this);
    }

    componentDidMount() {
        setTimeout(() => {
            ReactDOM.findDOMNode(this.refs.amount).focus();
        }, 300);
    }

    errorCallback(estr) {
        this.setState({ trxError: estr, loading: false });
    }

    onSubmit(e) {
        e.preventDefault();
        const { author, permlink, onClose } = this.props;
        const { amount } = this.state;
        this.setState({ loading: true });
        console.log('-- PromotePost.onSubmit -->');
        this.props.dispatchSubmit({
            amount,
            asset: DEBT_TICKER,
            author,
            permlink,
            onClose,
            currentUser: this.props.currentUser,
            errorCallback: this.errorCallback,
        });
    }

    amountChange(e) {
        const amount = e.target.value;
        // console.log('-- PromotePost.amountChange -->', amount);
        this.setState({ amount });
    }

    // assetChange(e) {
    //     const asset = e.target.value;
    //     console.log('-- PromotePost.assetChange -->', e.target.value);
    //     this.setState({asset});
    // }

    render() {
        const { amount, loading, amountError, trxError } = this.state;
        const { currentAccount } = this.props;
        const balanceValue = currentAccount.get('sbd_balance');
        const balance = balanceValue ? balanceValue.split(' ')[0] : 0.0;
        const submitDisabled = !amount;

        return (
            <div className="PromotePost row">
                <div className="column small-12">
                    <form
                        onSubmit={this.onSubmit}
                        onChange={() => this.setState({ trxError: '' })}
                    >
                        <h4>{tt('promote_post_jsx.promote_post')}</h4>
                        <p>
                            {tt(
                                'promote_post_jsx.spend_your_DEBT_TOKEN_to_advertise_this_post',
                                { DEBT_TOKEN }
                            )}.
                        </p>
                        <hr />
                        <div className="row">
                            <div className="column small-7 medium-5 large-4">
                                <label>{tt('g.amount')}</label>
                                <div className="input-group">
                                    <input
                                        className="input-group-field"
                                        type="text"
                                        placeholder={tt('g.amount')}
                                        value={amount}
                                        ref="amount"
                                        autoComplete="off"
                                        disabled={loading}
                                        onChange={this.amountChange}
                                    />
                                    <span className="input-group-label">
                                        {DEBT_TOKEN_SHORT + ' '} ({
                                            CURRENCY_SIGN
                                        })
                                    </span>
                                    <div className="error">{amountError}</div>
                                </div>
                            </div>
                        </div>
                        <div>
                            {tt('g.balance', {
                                balanceValue: `${balance} ${
                                    DEBT_TOKEN_SHORT
                                } (${CURRENCY_SIGN})`,
                            })}
                        </div>
                        <br />
                        {loading && (
                            <span>
                                <LoadingIndicator type="circle" />
                                <br />
                            </span>
                        )}
                        {!loading && (
                            <span>
                                {trxError && (
                                    <div className="error">{trxError}</div>
                                )}
                                <button
                                    type="submit"
                                    className="button"
                                    disabled={submitDisabled}
                                >
                                    {tt('g.promote')}
                                </button>
                            </span>
                        )}
                    </form>
                </div>
            </div>
        );
    }
}

// const AssetBalance = ({onClick, balanceValue}) =>
//     <a onClick={onClick} style={{borderBottom: '#A09F9F 1px dotted', cursor: 'pointer'}}>Balance: {balanceValue}</a>

export default connect(
    (state, ownProps) => {
        const currentUser = state.user.getIn(['current']);
        const currentAccount = state.global.getIn([
            'accounts',
            currentUser.get('username'),
        ]);
        return { ...ownProps, currentAccount, currentUser };
    },

    // mapDispatchToProps
    dispatch => ({
        dispatchSubmit: ({
            amount,
            asset,
            author,
            permlink,
            currentUser,
            onClose,
            errorCallback,
        }) => {
            const username = currentUser.get('username');
            alert('Promoted posts are currently disabled');
            //window.location.replace($STM_config.wallet_url + `/transfer?to=null&memo=@${author}/${permlink}&amount=`+parseFloat(amount, 10).toFixed(3) + ' ' + asset)

            const operation = {
                from: username,
                to: 'null',
                amount: parseFloat(amount, 10).toFixed(3) + ' ' + asset,
                memo: `@${author}/${permlink}`,
                __config: {
                    successMessage:
                        tt(
                            'promote_post_jsx.you_successfully_promoted_this_post'
                        ) + '.',
                },
            };
        },
    })
)(PromotePost);
