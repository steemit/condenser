import React, {PropTypes} from 'react'
import {connect} from 'react-redux'
import {decode} from 'shared/chain/memo'
import shouldComponentUpdate from 'app/utils/shouldComponentUpdate'
import { translate } from 'app/Translator';

class Memo extends React.Component {
    static propTypes = {
        text: PropTypes.string,
        // username: PropTypes.string,
        memo_private: PropTypes.object,
        // redux props
        myAccount: PropTypes.bool,
    }
    constructor() {
        super()
        this.shouldComponentUpdate = shouldComponentUpdate(this, 'Memo')
        this.decodeMemo = (memo_private, text) => {
            try {
                return decode(memo_private, text)
            } catch(e) {
                // if(/Invalid key/i.test(e.toString())) {
                console.error('memo decryption error', text, e)
                return 'Invalid memo'
            }
        }
    }
    render() {
        const {decodeMemo} = this
        const {memo_private, text, myAccount} = this.props
        const isEncoded = /^#/.test(text)

        if(!isEncoded) return <span>{text}</span>
        if(!myAccount) return <span></span>
        if(memo_private) return <span>{decodeMemo(memo_private, text)}</span>
        return <span>{translate('login_to_see_memo')}</span>
    }
}

export default connect(
    (state, ownProps) => {
        const currentUser = state.user.get('current')
        const myAccount = currentUser && ownProps.username === currentUser.get('username')
        const memo_private = myAccount && currentUser ?
            currentUser.getIn(['private_keys', 'memo_private']) : null
        return {...ownProps, memo_private, myAccount}
    }
)(Memo)
