/* eslint react/prop-types: 0 */
import React from 'react'
import shouldComponentUpdate from 'app/utils/shouldComponentUpdate'
import LoadingIndicator from 'app/components/elements/LoadingIndicator'
import TimeAgoWrapper from 'app/components/elements/TimeAgoWrapper'
import transaction from 'app/redux/Transaction'
import Memo from 'app/components/elements/Memo'
import { translate } from 'app/Translator';

class SavingsWithdrawHistory extends React.Component {

    constructor() {
        super()
        this.state = {}
        this.shouldComponentUpdate = shouldComponentUpdate(this, 'SavingsWithdrawHistory')
    }

    componentWillMount() {
        this.loadHistory()
    }

    componentWillReceiveProps(nextProps) {
        this.loadHistory(false, nextProps)
    }

    loadHistory(force = true, props = this.props) {
        const {savings_withdraws} = props
        const {loadHistory, username} = props
        if((force || !savings_withdraws) && username)
            loadHistory(username)
    }

    initActions(props = this.props) {
        const {savings_withdraws} = props
        savings_withdraws.forEach(withdraw => {
            const fro = withdraw.get('from')
            const request_id = withdraw.get('request_id')
            this['cancel_' + request_id] = () => {
                const {cancelWithdraw} = props
                this.setState({['loading_' + request_id]: true})
                const success = () => {
                    this.loadHistory()
                    this.setState({['loading_' + request_id]: false})
                }
                const fail = () => {
                    this.setState({['loading_' + request_id]: false})
                }
                cancelWithdraw(fro, request_id, success, fail)
            }
        })
    }

    render() {
        const {savings_withdraws} = this.props
        if(!savings_withdraws || !savings_withdraws.count()) return null
        this.initActions()
        let idx = 0
        const rows = savings_withdraws.map(withdraw => {
            const {complete, amount, to, from, memo, request_id} = withdraw.toJS()
            const dest = to === from ? translate('to') + ` ${to}` : translate('from') + ` ${from} ` + translate('to') + ` ${to}`
            const loading = this.state['loading_' + request_id]
            return <tr key={idx++}>
                <td><TimeAgoWrapper date={complete} /></td>
                <td>
                    {translate('withdraw')} {amount} {dest}
                    &nbsp;
                    {/* A cancel link puts the action very close to the info stating what is being canceled */}
                    {!loading && <span>(<a onClick={this['cancel_' + request_id]}>{translate('cancel')}</a>)</span>}
                    {loading && <span><LoadingIndicator type="circle" /></span>}
                </td>
                <td><Memo text={memo} /></td>
            </tr>
        })
        return <div className="SavingsWithdrawHistory">
            <div className="row">
                <div className="column small-12">
                    <h4>{translate('pending_savings_withdrawals').toUpperCase()}</h4>
                    <table>
                        <tbody>
                            {rows}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    }
}

import {connect} from 'react-redux'

export default connect(
    (state, ownProps) => {
        const username = state.user.getIn(['current', 'username'])
        const savings_withdraws = state.user.get('savings_withdraws')
        return {
            ...ownProps,
            username,
            savings_withdraws,
        }
    },
    dispatch => ({
        loadHistory: () => {
            dispatch({
                type: 'user/LOAD_SAVINGS_WITHDRAW',
                payload: {},
            })
        },
        cancelWithdraw: (fro, request_id, success, errorCallback) => {
            const confirm = translate('cancel_this_withdraw_request')
            const successCallback = () => {
                // refresh transfer history
                dispatch({type: 'global/GET_STATE', payload: {url: `@${fro}/transfers`}})
                success()
            }
            dispatch(transaction.actions.broadcastOperation({
                type: 'cancel_transfer_from_savings',
                operation: {from: fro, request_id},
                confirm,
                successCallback,
                errorCallback
            }))
        },
    })
)(SavingsWithdrawHistory)
