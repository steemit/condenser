import React, {Component} from 'react'
import PropTypes from 'prop-types'
import Tooltip from 'app/components/elements/Tooltip'
import {connect} from 'react-redux'
import user from 'app/redux/User'
import tt from 'counterpart';

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
                <Tooltip t={tt('g.remember_voting_and_posting_key')}>
                    {tt('g.auto_login_question_mark')} <a onClick={yes} className="uppercase">{tt('g.yes')}</a> / <a onClick={no} className="uppercase">{tt('g.no')}</a>
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
