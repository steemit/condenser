import React, { PropTypes, Component } from 'react';
import {connect} from 'react-redux';
import ReactDOM from 'react-dom';
import transaction from 'app/redux/Transaction';
import LoadingIndicator from 'app/components/elements/LoadingIndicator';
import { DEBT_TOKEN, DEBT_TOKEN_SHORT, CURRENCY_SIGN, DEBT_TICKER} from 'app/client_config';
import tt from 'counterpart';


class ProlongPost extends Component {

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
            trxError: ''
        };
        this.onSubmit = this.onSubmit.bind(this);
        this.errorCallback = this.errorCallback.bind(this);
        this.amountChange = this.amountChange.bind(this);
    }

    componentDidMount() {
        setTimeout(() => {
            ReactDOM.findDOMNode(this.refs.amount).focus()
        }, 300)
    }

    errorCallback(estr) {
        this.setState({ trxError: estr, loading: false });
    }

    onSubmit(e) {
        e.preventDefault();
        const {author, permlink, onClose} = this.props
        const {amount} = this.state
        this.setState({loading: true});
        console.log('-- ProlongPost.onSubmit -->');
        this.props.dispatchSubmit({amount, asset: DEBT_TICKER, author, permlink, onClose,
            currentUser: this.props.currentUser, errorCallback: this.errorCallback});
    }

    amountChange(e) {
        const amount = e.target.value;
        this.setState({amount});
    }

    render() {
        const {amount, loading, amountError, trxError} = this.state;
        const {currentAccount} = this.props;
        const balanceValue = currentAccount.get('sbd_balance');
        const balance = balanceValue ? balanceValue.split(' ')[0] : 0.0;
        const submitDisabled = !amount;

        return (
           <div className="ProlongPost row">
               <div className="column small-12">
                   <form onSubmit={this.onSubmit} onChange={() => this.setState({trxError: ''})}>
                       <h4>{tt('prolong_post_jsx.prolong_post')}</h4>
                       <p>{tt('prolong_post_jsx.spend_your_DEBT_TOKEN_to_prolong_payments_window_post', {DEBT_TOKEN})}.</p>
                       <hr />
                       <div className="row">
                           <div className="column small-4">
                               <label>{tt('g.amount')}</label>
                               <div className="input-group">
                                   <input className="input-group-field" type="text" placeholder={tt('g.amount')} value={amount} ref="amount" autoComplete="off" disabled={loading} onChange={this.amountChange} />
                                   <span className="input-group-label">{DEBT_TOKEN_SHORT + ' '} ({CURRENCY_SIGN})</span>
                                   <div className="error">{amountError}</div>
                               </div>
                           </div>
                       </div>
                       <div>{`${tt('transfer_jsx.balance')}: ${balance} ${DEBT_TOKEN_SHORT} (${CURRENCY_SIGN})`}</div>
                       <br />
                       {loading && <span><LoadingIndicator type="circle" /><br /></span>}
                       {!loading && <span>
                           {trxError && <div className="error">{trxError}</div>}
                           <button type="submit" className="button" disabled={submitDisabled}>{tt('g.prolong')}</button>
                        </span>}
                   </form>
               </div>
           </div>
       )
    }
}

export default connect(
    (state, ownProps) => {
        const currentUser = state.user.getIn(['current']);
        const currentAccount = state.global.getIn(['accounts', currentUser.get('username')]);
        return {...ownProps, currentAccount, currentUser}
    },
    dispatch => ({
        dispatchSubmit: ({amount, asset, author, permlink, currentUser, onClose, errorCallback}) => {
            const username = currentUser.get('username')
            const successCallback = () => {
                dispatch({type: 'global/GET_STATE', payload: {url: `@${username}/transfers`}}) // refresh transfer history
                onClose()
            }
            const operation = {
                from: username,
                to: 'null', amount: parseFloat(amount, 10).toFixed(3) + ' ' + asset,
                memo: `@${author}/${permlink}`,
                __config: {successMessage: tt('prolong_post_jsx.you_successfully_prolong_this_post') + '.'}
            }
            dispatch(transaction.actions.broadcastOperation({
                type: 'transfer',
                operation,
                successCallback,
                errorCallback
            }))
        }
    })
)(ProlongPost)
