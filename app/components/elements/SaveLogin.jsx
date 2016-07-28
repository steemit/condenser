import React, {Component, PropTypes} from 'react'
import Tooltip from 'app/components/elements/Tooltip'
import {connect} from 'react-redux'
import user from 'app/redux/User'

const {bool, func} = PropTypes

class SaveLogin extends Component {
    static propTypes = {
        saveLoginConfirm: bool,
        yes: func,
        no: func,
    }
    render() {
        const {props: {saveLoginConfirm, no, yes}} = this
        if (!saveLoginConfirm) return <span></span>
        setTimeout(() => {no()}, 7.5 * 1000)
        return (
            <span style={{backgroundColor: 'white'}}>
                <Tooltip t="Remember voting & posting key">
                    Auto login? <a onClick={yes}>YES</a> / <a onClick={no}>NO</a>
                </Tooltip>
            </span>
        )
    }
}
// export default connect(
//     state => {
//         if (!state.user) return
//         return {
//             saveLoginConfirm: state.user.get('saveLoginConfirm'),
//         }
//     },
//     dispatch => ({
//         no: () => {dispatch(user.actions.saveLoginConfirm(false))},
//         yes: () => {
//             dispatch(user.actions.saveLoginConfirm(false))
//             dispatch(user.actions.saveLogin())
//         },
//     })
// )(SaveLogin)
