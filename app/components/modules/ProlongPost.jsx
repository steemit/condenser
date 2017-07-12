import React, { PropTypes, Component } from 'react';
import {connect} from 'react-redux';
import ReactDOM from 'react-dom';
import transaction from 'app/redux/Transaction';
import LoadingIndicator from 'app/components/elements/LoadingIndicator';
import { DEBT_TOKEN_SHORT, CURRENCY_SIGN, DEBT_TICKER} from 'app/client_config';
import tt from 'counterpart';
import Slider from 'react-rangeslider';

Date.prototype.addDays = function(days) {
  var dat = new Date(this.valueOf());
  dat.setDate(dat.getDate() + days);
  return dat;
}

class ProlongPost extends Component {

    static propTypes = {
        author: PropTypes.string.isRequired,
        permlink: PropTypes.string.isRequired,
        dispatchSubmit: React.PropTypes.func.isRequired,
        dispatchGetPayoutWindow: React.PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            amount: '1.0',
            asset: '',
            loading: false,
            amountError: '',
            days: 1,
            trxError: ''
        };
        this.onSubmit = this.onSubmit.bind(this);
        this.errorCallback = this.errorCallback.bind(this);
        this.amountChange = this.amountChange.bind(this);

        this.handleDaysChange = days => {
            const {author, permlink, onClose} = this.props
            const {amount} = this.state
            const now = new Date()
            const time = now.addDays(days).toISOString().slice(0,-5)
            // cost: parseFloat(amount, 10).toFixed(3) + ' ' + DEBT_TICKER // if get_time_by_cost

            this.setState({loading: true});
            this.props.dispatchGetPayoutWindow({
              type: 'getcost', // 'gettime' if get_time_by_cost
              author,
              permlink,
              // cost, // if get_time_by_cost
              time,
              onClose,
              onError: this.errorCallback,
            // })
            // .then(data => {
            //   if (data) {
            //     // browserHistory.replace(`/${content.category}/@${post}`)
            //     this.setState({days})
            //   }
            // }).catch((error) => {
            //   this.setState({loading: false});
            //   this.errorCallback(error)
            });
        }
    }

    componentDidMount() {}

    errorCallback(estr) {
        this.setState({ trxError: estr, loading: false });
    }

    onSubmit(e) {
        e.preventDefault();
        const {author, permlink, onClose} = this.props
        const {amount, days} = this.state
        this.setState({loading: true});
        console.log('-- ProlongPost.onSubmit -->');
        this.props.dispatchSubmit({amount, days, asset: DEBT_TICKER, author, permlink, onClose,
            currentUser: this.props.currentUser, errorCallback: this.errorCallback});
    }

    amountChange(e) {
        const amount = e.target.value;
        this.setState({amount});
    }

    render() {
        const DEBT_TOKENS = tt('token_names.DEBT_TOKENS')

        const {amount, loading, amountError, trxError, days} = this.state;
        const {currentAccount} = this.props;
        const balanceValue = currentAccount.get('sbd_balance');
        const balance = balanceValue ? balanceValue.split(' ')[0] : 0.0;
        const submitDisabled = !amount;

        return (
           <div className="ProlongPost row">
               <div className="column small-12">
                   <form onSubmit={this.onSubmit} onChange={() => this.setState({trxError: ''})}>
                       <h4>{tt('prolong_post_jsx.prolong_post')}</h4>
                       <hr />
                       <p>{tt('prolong_post_jsx.spend_your_DEBT_TOKEN_to_prolong_payments_window_post', {DEBT_TOKENS})}.</p>
                       <div className="row">
                           <div className="column small-8">
                               <label>{tt('prolong_post_jsx.days')}</label>
                               <Slider className={loading && 'rangeslider__disabled' || ''} min={1} max={7} step={1} value={days} onChange={this.handleDaysChange} />
                               <div className="input-group">
                                   <span className="input-group-label">{days + ' / ' + amount}</span>
                                   <span className="input-group-label">{tt('prolong_post_jsx.days_short') + ' / ' + DEBT_TOKEN_SHORT + ' '} ({CURRENCY_SIGN})</span>
                               </div>
                               <div className="error">{amountError}</div>
                           </div>
                       </div>
                       <div>{`${tt('transfer_jsx.balance')}: ${balance} ${DEBT_TOKEN_SHORT} (${CURRENCY_SIGN})`}</div>
                       <br />
                       {loading && <span><LoadingIndicator type="circle" /><br /></span>}
                       {!loading && <span>
                           {trxError && <div className="error">{trxError}</div>}
                           <button type="submit" className="button" disabled={true}>{tt('g.prolong')}</button>
                        </span>}
                   </form>
               </div>
           </div>
       )
    }
}

export default connect(
    (state, ownProps) => {
        const payoutWindow = state.global.get('payoutWindow')
        const currentUser = state.user.getIn(['current']);
        const currentAccount = state.global.getIn(['accounts', currentUser.get('username')]);
        return {...ownProps, currentAccount, currentUser, payoutWindow}
    },
    dispatch => ({
        dispatchGetPayoutWindow: ({type, author, permlink, time, cost, onClose, onError}) => {
          const onSuccess = () => {
            console.log('-- dispatchGetPayoutWindow.onSuccess --')
            // dispatch({type: 'global/GET_STATE', payload: {url: `@${username}/transfers`}}) // refresh transfer history
            // onClose()
          }
          dispatch({type: 'PAYOUT_WINDOW_REQUEST', payload: {type, author, permlink, time, cost, onSuccess, onError}})
        },

        dispatchSubmit: ({amount, days, asset, author, permlink, currentUser, onClose, errorCallback}) => {
            const now = new Date()
            const timestamp = now.addDays(days).toISOString().slice(0,-5)
            const username = currentUser.get('username')
            const successCallback = () => {
                dispatch({type: 'global/GET_STATE', payload: {url: `@${username}/transfers`}}) // refresh transfer history
                onClose()
            }
            const operation = {
                payer: username,
                author,
                permlink,
                timestamp,
                __config: {successMessage: tt('prolong_post_jsx.you_successfully_prolong_this_post') + '.'}
            }
            dispatch(transaction.actions.broadcastOperation({
                type: 'comment_payout_extension_operation',
                operation,
                successCallback,
                errorCallback
            }))
        }
    })
)(ProlongPost)
