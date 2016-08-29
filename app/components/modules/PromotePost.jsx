import React, { PropTypes, Component } from 'react';
import {connect} from 'react-redux';
import ReactDOM from 'react-dom';
import transaction from 'app/redux/Transaction';
import LoadingIndicator from 'app/components/elements/LoadingIndicator';

class PromotePost extends Component {

    static propTypes = {
        author: PropTypes.string.isRequired,
        permlink: PropTypes.string.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            amount: '',
            asset: '',
            loading: false,
            amountError: '',
            trxError: ''
        };
        this.onSubmit = this.onSubmit.bind(this);
        this.errorCallback = this.errorCallback.bind(this);
        this.amountChange = this.amountChange.bind(this);
        this.assetChange = this.assetChange.bind(this);
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
        const {amount, asset} = this.state
        this.setState({loading: true});
        console.log('-- PromotePost.onSubmit -->');
        this.props.dispatchSubmit({amount, asset, author, permlink, onClose,
            currentUser: this.props.currentUser, errorCallback: this.errorCallback});
    }

    amountChange(e) {
        const amount = e.target.value;
        console.log('-- PromotePost.amountChange -->', amount);
        this.setState({amount});
    }

    assetChange(e) {
        const asset = e.target.value;
        console.log('-- PromotePost.assetChange -->', e.target.value);
        this.setState({asset});
    }

    render() {
        const {amount, asset, loading, amountError, trxError} = this.state;
        const {currentAccount, currentUser} = this.props;
        const balanceValue =
            !asset || asset.value === 'STEEM' ? currentAccount.get('balance') :
            asset.value === 'SBD' ? currentAccount.get('sbd_balance') :
            null

        const submitDisabled = !amount || !asset;

        return (
           <div className="PromotePost row">
               <div className="column small-12">
                   <form onSubmit={this.onSubmit} onChange={() => this.setState({trxError: ''})}>
                       <h4>Promote Post</h4>
                       <p>Please select an amount and currency below</p>
                       <div className="row">
                           <div className="column small-4">
                               <label> Amount
                                <input type="text" placeholder="Amount" value={amount} ref="amount" autoComplete="off" disabled={loading} onChange={this.amountChange} />
                                <div className="error">{amountError}</div>
                               </label>
                               <label> Currency
                                   <select onChange={this.assetChange} disabled={loading} value={asset}>
                                        <option></option>
                                        <option value="STEEM">STEEM</option>
                                        <option value="SBD">SBD</option>
                                   </select>
                               </label>
                               {/*<AssetBalance balanceValue={balanceValue} />*/}
                           </div>
                       </div>
                       <br />
                       {loading && <span><LoadingIndicator type="circle" /><br /></span>}
                       {!loading && <span>
                           {trxError && <div className="error">{trxError}</div>}
                           <button type="submit" className="button" disabled={submitDisabled}>Promote</button>
                        </span>}
                   </form>
               </div>
           </div>
       )
    }
}

// const AssetBalance = ({onClick, balanceValue}) =>
//     <a onClick={onClick} style={{borderBottom: '#A09F9F 1px dotted', cursor: 'pointer'}}>Balance: {balanceValue}</a>

export default connect(
    (state, ownProps) => {
        const currentUser = state.user.getIn(['current']);
        const currentAccount = state.global.getIn(['accounts', currentUser.get('username')]);
        return {...ownProps, currentAccount, currentUser}
    },

    // mapDispatchToProps
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
                memo: author + '/' + permlink
            }
            dispatch(transaction.actions.broadcastOperation({
                type: 'transfer',
                operation,
                successCallback,
                errorCallback
            }))
        }
    })
)(PromotePost)
