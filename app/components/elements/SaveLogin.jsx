import React, {Component, PropTypes} from 'react'
import Tooltip from 'app/components/elements/Tooltip'
import {connect} from 'react-redux'
import user from 'app/redux/User'
import { translate } from 'app/Translator';

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
                <Tooltip t={translate('remember_voting_and_posting_key')}>
                    {translate('auto_login_question_mark')} <a onClick={yes} className="uppercase">{translate('yes')}</a> / <a onClick={no} className="uppercase">{translate('no')}</a>
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
