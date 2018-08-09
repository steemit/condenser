import React from 'react'
import PropTypes from 'prop-types'
import ReactDOM from 'react-dom'
import { connect } from 'react-redux'
import reactForm from 'app/utils/ReactForm'
import transaction from 'app/redux/Transaction'
import { validate_account_name } from 'app/utils/ChainValidation'
import { vestsToGolos, golosToVests } from 'app/utils/StateFunctions';
import { LIQUID_TICKER } from 'app/client_config'
import tt from 'counterpart'
import LoadingIndicator from 'app/components/elements/LoadingIndicator'

class DelegateVestingShares extends React.Component {

    static propTypes = {
        currentAccount: PropTypes.object.isRequired
    }

    constructor(props) {
        super(props)
        this.initForm(props)
    }

    componentDidMount() {
        setTimeout(() => {
            ReactDOM.findDOMNode(this.refs.to).focus()
        }, 300)
    }

    initForm(props) {
        const fields = [ 'to', 'amount' ]

        const insufficientFunds = (amount) => {
            const { gprops, currentAccount } = this.props
			const balance = vestsToGolos(currentAccount.get('vesting_shares'), gprops)
            return parseFloat(amount) > parseFloat(balance)
		}

        reactForm({
            name: 'delegate_vesting',
            instance: this, fields,
            initialValues: props.initialValues,

            validation: values => ({
                to:
                    !values.to
                        ? tt('g.required')
                        : validate_account_name(values.to),
                amount:
                  !values.amount
                    ? tt('g.required') 
                    : !/^[0-9]*\.?[0-9]*/.test(values.amount) 
                        ? tt('transfer_jsx.amount_is_in_form')
                        : insufficientFunds(values.amount)
                            ? tt('transfer_jsx.insufficient_funds')
                            : null
            })
        })
    }

    balanceValue = () => {
        const { gprops, currentAccount } = this.props
        return vestsToGolos(currentAccount.get('vesting_shares'), gprops)
    }

	assetBalanceClick = e => {
		e.preventDefault()
		this.state.amount.props.onChange(this.balanceValue())
	}

    clearError = () => { this.setState({ trxError: undefined }) }

    errorCallback = estr => { this.setState({ trxError: estr, loading: false }) }

    onChangeTo = (e) => {
        const { value } = e.target
        this.state.to.props.onChange(value.toLowerCase().trim())
    }

    render() {
        const { gprops, currentAccount, dispatchSubmit } = this.props
        const { to, amount, loading, trxError } = this.state
        const { submitting, valid, handleSubmit } = this.state.delegate_vesting

        const VESTING_TOKEN2 = tt('token_names.VESTING_TOKEN2')

        const form = (
            <form 
                onSubmit={handleSubmit(({ data }) => {
                    this.setState({ loading: true })
                    const success = () => {
                        if(this.props.onClose) this.props.onClose()
                        this.setState({ loading: false })
                    }
                    dispatchSubmit({ ...data, errorCallback: this.errorCallback, success, gprops, currentAccount })
                })}
                onChange={this.clearError}
            >
                <div className="row">
                    <div className="column small-2" style={{paddingTop: 5}}>{tt('g.from')}</div>
                    <div className="column small-10">
                        <div className="input-group" style={{marginBottom: "1.25rem"}}>
                            <span className="input-group-label">@</span>
                            <input
                                className="input-group-field bold"
                                type="text"
                                disabled
                                value={currentAccount.get('name')}
                            />
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="column small-2" style={{paddingTop: 5}}>{tt('g.to')}</div>
                    <div className="column small-10">
                        <div className="input-group" style={{marginBottom: "1.25rem"}}>
                            <span className="input-group-label">@</span>
                            <input
                                className="input-group-field"
                                {...to.props}
                                ref="to"
                                type="text"
                                placeholder={tt('transfer_jsx.send_to_account')}
                                onChange={this.onChangeTo}
                                autoComplete="off"
                                autoCorrect="off"
                                autoCapitalize="off"
                                spellCheck="false"
                                disabled={loading}
                            />
                        </div>
                        {to.touched && to.blur && to.error && <div className="error">{to.error}&nbsp;</div>}
                    </div>
                </div>

                <div className="row">
                    <div className="column small-2" style={{paddingTop: 5}}>{tt('g.amount')}</div>
                    <div className="column small-10">
                        <div className="input-group" style={{marginBottom: "0.25rem"}}>
                            <input type="text"
                                {...amount.props}
                                placeholder={tt('g.amount')}
                                ref="amount"
                                autoComplete="off"
                                autoCorrect="off"
                                autoCapitalize="off"
                                spellCheck="false"
                                disabled={loading}
                            />
                            <span className="input-group-label uppercase">{LIQUID_TICKER}</span>
                        </div>

						<div style={{marginBottom: "1.5rem"}}>
							<AssetBalance
								balanceValue={`${this.balanceValue()} ${LIQUID_TICKER}`}
								onClick={this.assetBalanceClick}
								title={tt('transfer_jsx.balance')}
							/>
						</div>

                      {(amount.touched && amount.error)
                          ?
                            <div className="error">
                              {amount.touched && amount.error && amount.error}&nbsp;
                            </div>
                          :
                            null
                      }
                    </div>
                </div>

                {loading && <span><LoadingIndicator type="circle" /><br /></span>}
                {!loading && <span>
                    {trxError && <div className="error">{trxError}</div>}
                    <button type="submit" disabled={submitting || !valid} className="button">
                        {tt('delegatevestingshares_jsx.button_title')}
                    </button>
                </span>}
            </form>
        )

        return (
            <div>
                <div className="row">
                    <h3>{tt('delegatevestingshares_jsx.form_title', {VESTING_TOKEN2})}</h3>
                </div>
                {form}
            </div>
        )
    }
}

const AssetBalance = ({onClick, balanceValue, title}) =>
	<a onClick={onClick} style={{borderBottom: '#A09F9F 1px dotted', cursor: 'pointer'}}>{title + ": " + balanceValue}</a>

export default connect(

    (state, ownProps) => {
        const initialValues = { to: null }
        const currentUser = state.user.getIn(['current'])
        const currentAccount = state.global.getIn(['accounts', currentUser.get('username')])
        const gprops = state.global.get('props').toJS()
        
        return {
            ...ownProps,
            initialValues,
            currentAccount,
            gprops,
        }
    },

    dispatch => ({
        dispatchSubmit: ({ to, amount, errorCallback, success, gprops, currentAccount }) => {
            const delegator = currentAccount.get('name')
            const delegatee = to
            const vesting_shares = `${golosToVests(amount, gprops)} GESTS`

            const successCallback = () => {
                dispatch({ type: 'FETCH_STATE', payload: { pathname: `@${delegator}/transfers` } })
                success();
            }

            dispatch(transaction.actions.broadcastOperation({
                type: 'delegate_vesting_shares',
                operation: {
                    delegator,
                    delegatee,
                    vesting_shares
                },
                successCallback,
                errorCallback
            }))
        }
    })

)(DelegateVestingShares)
