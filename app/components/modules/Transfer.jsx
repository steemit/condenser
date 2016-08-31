import React, { PropTypes, Component } from 'react';
import ReactDOM from 'react-dom';
import {reduxForm} from 'redux-form';
import {Map} from 'immutable';
import transaction from 'app/redux/Transaction';
import user from 'app/redux/User';
import LoadingIndicator from 'app/components/elements/LoadingIndicator';
import {powerTip, powerTip2, powerTip3} from 'app/utils/Tips'
import {cleanReduxInput} from 'app/utils/ReduxForms'
import { translate } from '../../Translator.js';


/** Warning .. This is used for Power UP too. */
class TransferForm extends Component {

    static propTypes = {

        // redux
        currentUser: PropTypes.object.isRequired,
        toVesting: PropTypes.bool.isRequired,
        currentAccount: PropTypes.object.isRequired,

        // redux-form
        fields: PropTypes.object.isRequired,
        handleSubmit: PropTypes.func.isRequired,
        resetForm: PropTypes.func.isRequired,
        submitting: PropTypes.bool.isRequired,
        dispatchSubmit: PropTypes.func.isRequired,
    }

    constructor(props) {
        super()
        this.state = {advanced: !props.toVesting}
    }

    componentDidMount() {
        setTimeout(() => {
            const {to} = this.props.fields
            if (!to.value || to.value === '')
                ReactDOM.findDOMNode(this.refs.to).focus()
            else
                ReactDOM.findDOMNode(this.refs.amount).focus()
        }, 300)
    }

    onAdvanced = (e) => {
        e.preventDefault() // prevent form submission!!
        if(!this.state.advance) {
            const username = this.props.currentUser.get('username')
            this.props.fields.to.onChange(username)
        }
        this.setState({advanced: !this.state.advanced})
    }

    render() {
        const {loading, trxError, advanced} = this.state
        const {
            currentUser, currentAccount, toVesting,
            fields: {to, amount, asset, memo},
            handleSubmit, dispatchSubmit, submitting
        } = this.props
        // window.reduxFormPerformFix(this.props.fields)
        const balanceValue =
            !asset || asset.value === 'STEEM' ? currentAccount.get('balance') :
            asset.value === 'SBD' ? currentAccount.get('sbd_balance') :
            null
        const clearError = () => {this.setState({ trxError: undefined })}
        const errorCallback = estr => { this.setState({ trxError: estr, loading: false }) }
        const assetBalanceClick = e => {
            e.preventDefault()
            // Convert '9.999 STEEM' to 9.999
            amount.onChange(balanceValue.split(' ')[0])
        }
        const isMemoPrivate = memo && /^#/.test(memo.value)
        const form = (
            <form onSubmit={handleSubmit(data => {
                // bind redux-form to react-redux
                console.log('Transfer\tdispatchSubmit')
                this.setState({loading: true})
                dispatchSubmit({...data, errorCallback, currentUser, toVesting})
            })}
                onChange={clearError}
            >
                {toVesting && <div className="row">
                    <div className="column small-12">
                        <p>{powerTip}</p>
                        <p>{powerTip2}</p>
                    </div>
                </div>}

                <div className="row">
                    <div className="column small-2">From</div>
                    <div className="column small-10">
                        <b>{currentUser.get('username')}</b>
                    </div>
                </div>

                {(advanced || !toVesting) && <div className="row">
                    <div className="column small-2">To</div>
                    <div className="column small-10">
                        <input type="text" placeholder="Send to account" {...cleanReduxInput(to)}
                            ref="to" autoComplete="off" disabled={loading} />
                        {to.touched && to.error ?
                            <div className="error">{to.error}&nbsp;</div> :
                            <p>{toVesting && powerTip3}</p>
                        }
                    </div>
                </div>}

                <div className="row">
                    <div className="column small-2">Amount</div>
                    <div className="column small-10">
                        <input type="text" placeholder="Amount" {...cleanReduxInput(amount)} ref="amount" autoComplete="off" disabled={loading} />
                        <div className="error">{amount.touched && amount.error && amount.error}&nbsp;</div>
                        {asset && <span>
                            <select {...cleanReduxInput(asset)} placeholder="Asset" disabled={loading}>
                                <option></option>
                                <option value="STEEM">STEEM</option>
                                <option value="SBD">SBD</option>
                            </select>
                        </span>}
                        <AssetBalance balanceValue={balanceValue} onClick={assetBalanceClick} />
                        <div className="error">{asset && asset.touched && asset.error && asset.error}&nbsp;</div>
                    </div>
                </div>
                {memo && <div className="row">
                    <div className="column small-2">Memo</div>
                    <div className="column small-10">
                        <small>This Memo is {isMemoPrivate ? 'Private' : 'Public'}</small>
                        <input type="text" placeholder="Memo" {...cleanReduxInput(memo)}
                            ref="memo" autoComplete="on" disabled={loading} />
                        <div className="error">{memo.touched && memo.error && memo.error}&nbsp;</div>
                    </div>
                </div>}
                {loading && <span><LoadingIndicator type="circle" /><br /></span>}
                {!loading && <span>
                    {trxError && <div className="error">{trxError}</div>}
                    <button type="submit" disabled={submitting} className="button">
                        {toVesting ? 'Power Up' : 'Transfer'}
                    </button>
                    {toVesting && <button className="button hollow no-border" disabled={submitting} onClick={this.onAdvanced}>{advanced ? 'Basic' : 'Advanced'}</button>}
                </span>}
            </form>
        )
        return (
           <div>
               <h3>{toVesting ? 'Convert to Steem Power' : 'Transfer to Account'}</h3>
               <div className="row">
                   <div className="column small-12">
                       {form}
                   </div>
               </div>
           </div>
       )
    }
}

const AssetBalance = ({onClick, balanceValue}) =>
    <a onClick={onClick} style={{borderBottom: '#A09F9F 1px dotted', cursor: 'pointer'}}>{translate('balance') + ': ' + balanceValue}</a>

export default reduxForm(
    // config
    { form: 'transfer' },

    // mapStateToProps
    (state, ownProps) => {
        const initialValues = state.user.get('transfer_defaults', Map()).toJS()
        const toVesting = initialValues.asset === 'VESTS'
        const fields = toVesting ? ['to', 'amount'] : ['to', 'amount', 'asset', 'memo']
        const currentUser = state.user.getIn(['current'])
        const currentAccount = state.global.getIn(['accounts', currentUser.get('username')])
        const insufficentFunds = (asset, amount) => {
            const balanceValue =
                !asset || asset === 'STEEM' ? currentAccount.get('balance') :
                asset === 'SBD' ? currentAccount.get('sbd_balance') :
                null
            if(!balanceValue) return false
            const balance = balanceValue.split(' ')[0]
            return parseFloat(amount) > parseFloat(balance)
        }

        if (toVesting && !initialValues.to)
            initialValues.to = currentUser.get('username')
        const validate = values => ({
            to:
                ! values.to ? 'Required' : null,
            amount:
                ! values.amount ? 'Required' :
                ! /^[0-9]*\.?[0-9]*/.test(values.amount) ? translate('amount_is_in_form') :
                insufficentFunds(values.asset, values.amount) ? translate('insufficent_funds') :
                null,
            asset:
                toVesting ? null :
                ! values.asset ? translate('required') : null,
        })
        return {
            ...ownProps,
            currentUser, currentAccount, toVesting,
            initialValues, fields, validate
        }
    },

    // mapDispatchToProps
    dispatch => ({
        dispatchSubmit: ({to, amount, asset, memo, toVesting, currentUser, errorCallback}) => {
            const username = currentUser.get('username')
            const successCallback = () => {
                dispatch({type: 'global/GET_STATE', payload: {url: `@${username}/transfers`}}) // refresh transfer history
                dispatch(user.actions.hideTransfer())
            }
            const asset2 = toVesting ? 'STEEM' : asset
            const operation = {
                from: username,
                to, amount: parseFloat(amount, 10).toFixed(3) + ' ' + asset2,
                memo: toVesting ? undefined : new Buffer(memo || '', 'utf-8')
            }
            dispatch(transaction.actions.broadcastOperation({
                type: toVesting ? 'transfer_to_vesting' : 'transfer',
                operation,
                successCallback,
                errorCallback
            }))
        }
    })
)(TransferForm)
