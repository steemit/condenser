/* eslint react/prop-types: 0 */
import React from 'react';
import ReactDOM from 'react-dom';
import { reduxForm } from 'redux-form'; // @deprecated, instead use: app/utils/ReactForm.js
import * as transactionActions from 'app/redux/TransactionReducer';
import * as appActions from 'app/redux/AppReducer';
import shouldComponentUpdate from 'app/utils/shouldComponentUpdate';
import TransactionError from 'app/components/elements/TransactionError';
import LoadingIndicator from 'app/components/elements/LoadingIndicator';
import { cleanReduxInput } from 'app/utils/ReduxForms';
import tt from 'counterpart';
import { DEBT_TOKEN, DEBT_TICKER, LIQUID_TOKEN } from 'app/client_config';

class ConvertToSteem extends React.Component {
    constructor() {
        super();
        this.state = {};
    }
    componentDidMount() {
        ReactDOM.findDOMNode(this.refs.amt).focus();
    }
    shouldComponentUpdate = shouldComponentUpdate(this, 'ConvertToSteem');
    dispatchSubmit = () => {
        const { convert, owner, onClose } = this.props;
        const { amount } = this.props.fields;
        const success = () => {
            if (onClose) onClose();
            this.setState({ loading: false });
        };
        const error = () => {
            this.setState({ loading: false });
        };
        convert(owner, amount.value, success, error);
        this.setState({ loading: true });
    };
    render() {
        const { dispatchSubmit } = this;
        const { onClose, handleSubmit, submitting } = this.props;
        const { amount } = this.props.fields;
        const { loading } = this.state;
        return (
            <form
                onSubmit={handleSubmit(data => {
                    dispatchSubmit(data);
                })}
            >
                <div className="row">
                    <div className="small-12 columns">
                        <h1>
                            {tt('converttosteem_jsx.convert_to_LIQUID_TOKEN', {
                                LIQUID_TOKEN,
                            })}
                        </h1>
                        <p>
                            {tt(
                                'converttosteem_jsx.DEBT_TOKEN_will_be_unavailable',
                                { DEBT_TOKEN }
                            )}
                        </p>
                        <p>
                            {tt(
                                'converttosteem_jsx.your_existing_DEBT_TOKEN_are_liquid_and_transferable',
                                { link: tt('g.buy_or_sell'), DEBT_TOKEN }
                            )}
                        </p>
                        <p>
                            {tt(
                                'converttosteem_jsx.this_is_a_price_feed_conversion'
                            )}
                        </p>
                    </div>
                </div>
                <div className="row">
                    <div className="small-12 columns">
                        <label>{tt('g.amount')}</label>
                        <input
                            type="amount"
                            ref="amt"
                            {...cleanReduxInput(amount)}
                            autoComplete="off"
                            disabled={loading}
                        />
                        &nbsp;
                        {DEBT_TOKEN}
                        <br />
                        <div className="error">
                            {amount.touched && amount.error && amount.error}&nbsp;
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="small-12 columns">
                        <TransactionError opType="convert" />
                        {loading && (
                            <span>
                                <LoadingIndicator type="circle" />
                            </span>
                        )}
                        <br />
                        <div>
                            <button
                                type="submit"
                                className="button"
                                disabled={loading}
                            >
                                {tt('g.convert')}
                            </button>
                            <button
                                type="button"
                                disabled={submitting}
                                className="button hollow float-right"
                                onClick={onClose}
                            >
                                {tt('g.cancel')}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        );
    }
}

export default reduxForm(
    { form: 'convertToSteem', fields: ['amount'] },
    // mapStateToProps
    (state, ownProps) => {
        const current = state.user.get('current');
        const username = current.get('username');
        const account = state.global.getIn(['accounts', username]);
        const sbd_balance = account.get('sbd_balance');
        const max = sbd_balance.split(' ')[0];
        const validate = values => ({
            amount: !values.amount
                ? tt('g.required')
                : isNaN(values.amount) || parseFloat(values.amount) <= 0
                  ? tt('g.invalid_amount')
                  : parseFloat(values.amount) > parseFloat(max)
                    ? tt('g.insufficient_balance')
                    : null,
        });
        return {
            ...ownProps,
            validate,
            owner: username,
        };
    },
    // mapDispatchToProps
    dispatch => ({
        convert: (owner, amt, success, error) => {
            const amount = [parseFloat(amt).toFixed(3), DEBT_TICKER].join(' ');
            const requestid = Math.floor(Date.now() / 1000);
            const conf = tt(
                'postfull_jsx.in_week_convert_DEBT_TOKEN_to_LIQUID_TOKEN',
                { amount: amount.split(' ')[0], DEBT_TOKEN, LIQUID_TOKEN }
            );
            dispatch(
                transactionActions.broadcastOperation({
                    type: 'convert',
                    operation: { owner, requestid, amount },
                    confirm: conf + '?',
                    successCallback: () => {
                        success();
                        dispatch(
                            appActions.addNotification({
                                key: 'convert_sd_to_steem_' + Date.now(),
                                message: tt('g.order_placed', { order: conf }),
                                dismissAfter: 5000,
                            })
                        );
                    },
                    errorCallback: () => {
                        error();
                    },
                })
            );
        },
    })
)(ConvertToSteem);
