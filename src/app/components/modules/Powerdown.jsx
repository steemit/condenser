import React from 'react';
import {connect} from 'react-redux'
import g from 'app/redux/GlobalReducer'
import reactForm from 'app/utils/ReactForm'
import Slider from 'react-rangeslider';
import transaction from 'app/redux/Transaction';
import user from 'app/redux/User';
import tt from 'counterpart'
import {VEST_TICKER, LIQUID_TICKER} from 'app/client_config'
import {numberWithCommas, spToVestsf, vestsToSpf, vestsToSp, assetFloat} from 'app/utils/StateFunctions'

class Powerdown extends React.Component {

    constructor(props, context) {
        super(props, context)
        this.state = {
            broadcasting: false,
            manual_entry: false,
            new_withdraw: (props.to_withdraw !== 0) ? props.to_withdraw : props.available_shares
        }
    }

    render() {
        const {broadcasting, new_withdraw, manual_entry} = this.state
        const {account, available_shares, withdrawn, to_withdraw, vesting_shares, delegated_vesting_shares} = this.props
        const formatSp = (amount) => numberWithCommas(vestsToSp(this.props.state, amount))
        const sliderChange = (value) => {
            this.setState({new_withdraw: value, manual_entry: false})
        }
        const inputChange = (event) => {
            event.preventDefault()
            let value = spToVestsf(this.props.state, parseFloat(event.target.value.replace(/,/g, '')))
            if (!isFinite(value)) {
                value = new_withdraw
            }
            this.setState({new_withdraw: value, manual_entry: event.target.value})
        }
        const powerDown = (event) => {
            event.preventDefault()
            this.setState({broadcasting: true})
            const successCallback = this.props.successCallback
            const errorCallback = (error) => {
                this.setState({toggleDivestError: error.toString()})
                successCallback()
            }
            const vesting_shares = `${ new_withdraw.toFixed(6) } ${ VEST_TICKER }`
            this.props.withdrawVesting({account, vesting_shares, errorCallback, successCallback})
        }

        const notes = []
        if (to_withdraw !== 0) {
            notes.push(
                <li>
                    You are already powering down {formatSp(to_withdraw)} {LIQUID_TICKER} ({formatSp(withdrawn)} {LIQUID_TICKER} paid out so far).
                    Note that if you change the power down amount the payout schedule will reset.
                </li>
            )
        }
        if (delegated_vesting_shares !== 0) {
            notes.push(
                <li>
                    You are delegating {formatSp(delegated_vesting_shares)} {LIQUID_TICKER}, those are locked up and not
                    available to power down until the delgation is removed and a full reward period has passed.
                </li>
            )
        }

        return (
            <div>
                <div className="row">
                    <h3 className="column">{tt('powerdown_jsx.power_down')} {broadcasting}</h3>
                </div>
                <Slider
                    value={new_withdraw}
                    max={vesting_shares - delegated_vesting_shares}
                    format={formatSp}
                    onChange={sliderChange}
                />
                <p className="powerdown-amount">
                    {tt('powerdown_jsx.power_down_amount')}:
                    <input
                        value={manual_entry ? manual_entry : formatSp(new_withdraw)}
                        onChange={inputChange}
                        autoCorrect={false} />
                    {LIQUID_TICKER}
                </p>
                <ul className="powerdown-notes">{notes}</ul>
                <button type="submit" className="button float-right" onClick={powerDown} disabled={broadcasting}>{tt('powerdown_jsx.power_down')}</button>
            </div>
        )
     }
}

export default connect(
    // mapStateToProps
    (state, ownProps) => {
        const values = state.user.get('powerdown_defaults')
        const account = values.get('account')
        const to_withdraw = parseFloat(values.get('to_withdraw')) / 1e6
        const withdrawn = parseFloat(values.get('withdrawn')) / 1e6
        const vesting_shares = assetFloat(values.get('vesting_shares'), VEST_TICKER)
        const delegated_vesting_shares = assetFloat(values.get('delegated_vesting_shares'), VEST_TICKER)

        const available_shares = vesting_shares - to_withdraw - withdrawn

        return {
            ...ownProps,
            account,
            available_shares,
            delegated_vesting_shares,
            state,
            to_withdraw,
            vesting_shares,
            withdrawn,
        }
    },
    // mapDispatchToProps
    dispatch => ({
        successCallback: () => {
            dispatch(user.actions.hidePowerdown())
        },
        powerDown: (e) => {
            e.preventDefault()
            const name = 'powerDown';
            dispatch(g.actions.showDialog({name}))
        },
        withdrawVesting: ({account, vesting_shares, errorCallback, successCallback}) => {
            const successCallbackWrapper = (...args) => {
                dispatch({type: 'global/GET_STATE', payload: {url: `@${account}/transfers`}})
                return successCallback(...args)
            }
            dispatch(transaction.actions.broadcastOperation({
                type: 'withdraw_vesting',
                operation: {account, vesting_shares},
                errorCallback,
                successCallback: successCallbackWrapper,
            }))
        },
    })
)(Powerdown)
