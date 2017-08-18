import React from 'react';
import {connect} from 'react-redux'
import g from 'app/redux/GlobalReducer'
import reactForm from 'app/utils/ReactForm'
import Slider from 'react-rangeslider';
import transaction from 'app/redux/Transaction';
import user from 'app/redux/User';
import tt from 'counterpart'
import {numberWithCommas, vestingSteem, vestsToSp} from 'app/utils/StateFunctions'

class Powerdown extends React.Component {

    componentDidMount() {
        console.log(this.props)
    }

    render() {
        return (
            <div>
                <h1>to_withdraw: {this.props.to_withdraw}</h1>
                <p>Behold the revolutionary react where you can pass state!*</p>
                <p><sub>* some restrictions apply, face-call Mark Zuckerberg for details.</sub></p>
            </div>
        )
     }
}

export default connect(
    // mapStateToProps
    (state, ownProps) => {
        const initialValues = state.user.get('powerdown_defaults', Map()).toJS()
        const {to_withdraw} = initialValues
        return {...ownProps, to_withdraw}
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
