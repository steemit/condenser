/* eslint react/prop-types: 0 */
import React from 'react'
import ReactDOM from 'react-dom';
import {reduxForm} from 'redux-form'; // @deprecated, instead use: app/utils/ReactForm.js
import transaction from 'app/redux/Transaction'
import shouldComponentUpdate from 'app/utils/shouldComponentUpdate'
import TransactionError from 'app/components/elements/TransactionError'
import LoadingIndicator from 'app/components/elements/LoadingIndicator'
import {cleanReduxInput} from 'app/utils/ReduxForms'
import { translate } from 'app/Translator';
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import { DEBT_TOKEN, DEBT_TICKER } from 'config/client_config';

class ConvertToSteem extends React.Component {
    constructor() {
        super()
        this.state = {}
    }
    componentDidMount() {
        ReactDOM.findDOMNode(this.refs.amt).focus()
    }
    shouldComponentUpdate = shouldComponentUpdate(this, 'ConvertToSteem')
    dispatchSubmit = () => {
        const {convert, owner, onClose} = this.props
        const {amount} = this.props.fields
        const success = () => {
            if(onClose) onClose()
            this.setState({loading: false})
        }
        const error = () => {
            this.setState({loading: false})
        }
        convert(owner, amount.value, success, error)
        this.setState({loading: true})
    }
    render() {
        const {dispatchSubmit} = this
        const {onClose, handleSubmit, submitting} = this.props
        const {amount} = this.props.fields
        const {loading} = this.state
        return (
            <form onSubmit={handleSubmit(data => {dispatchSubmit(data)})}>
                <div className="row">
                    <div className="small-12 columns">
                        <h1>{translate('convert_to_LIQUID_TOKEN')}</h1>
                        <p>{translate('DEBT_TOKEN_will_be_unavailable')}.</p>
                        {/* using <FormattedMessage /> because nested html tag in values doesn't want to be rendered properly in translate() */}
                        <p><FormattedMessage id="your_existing_DEBT_TOKEN_are_liquid_and_transferable" values={{ link: <i>{translate("buy_or_sell")}</i> }} /></p>
                        <p>{translate('this_is_a_price_feed_conversion')}.</p>
                    </div>
                </div>
                <div className="row">
                    <div className="small-12 columns">
                        <label>{translate('amount')}</label>
                        <input type="amount" ref="amt" {...cleanReduxInput(amount)} autoComplete="off" disabled={loading} />
                        &nbsp;
                        {DEBT_TOKEN}
                        <br />
                        <div className="error">{amount.touched && amount.error && amount.error}&nbsp;</div>
                    </div>
                </div>
                <div className="row">
                    <div className="small-12 columns">
                        <TransactionError opType="convert" />
                        {loading && <span><LoadingIndicator type="circle" /></span>}
                        <br />
                        <div>
                            <button type="submit" className="button" disabled={loading}>
                                {translate('convert')}
                            </button>
                            <button type="button" disabled={submitting} className="button hollow float-right" onClick={onClose}>
                                {translate('cancel')}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        )
    }
}
export default reduxForm(
    { form: 'convertToSteem', fields: ['amount'] },
    // mapStateToProps
    (state, ownProps) => {
        const current = state.user.get('current')
        const username = current.get('username')
        const account = state.global.getIn(['accounts', username])
        const sbd_balance = account.get('sbd_balance')
        const max = sbd_balance.split(' ')[0]
        const validate = values => ({
            amount: ! values.amount ? translate('required') :
                isNaN(values.amount) || parseFloat(values.amount) <= 0 ? translate('invalid_amount') :
                parseFloat(values.amount) > parseFloat(max) ? translate('insufficient_balance') :
                null,
        })
        return {
            ...ownProps,
            validate,
            owner: username,
        }
    },
    // mapDispatchToProps
    dispatch => ({
        convert: (owner, amt, success, error) => {
            const amount = [parseFloat(amt).toFixed(3), DEBT_TICKER].join(" ")
            const requestid = Math.floor(Date.now() / 1000)
            const conf = translate('in_week_convert_DEBT_TOKEN_to_LIQUID_TOKEN', { amount: amount.split(' ')[0] })
            dispatch(transaction.actions.broadcastOperation({
                type: 'convert',
                operation: {owner, requestid, amount},
                confirm: conf + '?',
                successCallback: () => {
                    success()
                    dispatch({type: 'ADD_NOTIFICATION', payload:
                        {key: "convert_sd_to_steem_" + Date.now(),
                         message: translate('order_placed') + ': ' + conf,
                         dismissAfter: 5000}
                    })
                },
                errorCallback: () => {error()}
            }))
        },
    })
)(ConvertToSteem)
