/* eslint react/prop-types: 0 */
import React, {PropTypes, Component} from 'react'
import {Map, List} from 'immutable'
import {connect} from 'react-redux'
import user from 'app/redux/User'
import g from 'app/redux/GlobalReducer'
import ShowKey from 'app/components/elements/ShowKey'
import { translate } from 'app/Translator';

class Keys extends Component {
    static propTypes = {
        // HTML
        account: PropTypes.object.isRequired, // immutable Map
        authType: PropTypes.oneOf(['posting', 'active', 'owner', 'memo']),
    }
    constructor() {
        super()
        this.state = {}
    }
    shouldComponentUpdate(nextProps, nextState) {
        return this.props.auth !== nextProps.auth ||
            this.props.authType !== nextProps.authType ||
            this.props.authLogin !== nextProps.authLogin ||
            this.props.account !== nextProps.account ||
            this.state !== nextState
    }
    showChangePassword = (pubkey) => {
        const {account, authType} = this.props
        this.props.showChangePassword(account.get('name'), authType, pubkey)
    }
    render() {
        const {
            props: {account, authType, privateKeys, onKey},
        } = this
        let pubkeys
        if (authType === 'memo') {
            pubkeys = List([account.get('memo_key')])
        } else {
            const authority = account.get(authType)
            const authorities = authority.get('key_auths')
            pubkeys = authorities.map(a => a.get(0))
        }
        const rowClass = 'hoverBackground'
        let idx = 0
        const auths = pubkeys.map(pubkey => (
            <div key={idx++}>
                <div className="row">
                    <div className="column small-12">
                        <span className={rowClass}>
                            <ShowKey pubkey={pubkey}
                                privateKey={privateKeys.get(authType + '_private')}
                                cmpProps={{className: rowClass}} authType={authType} accountName={account.get('name')}
                                onKey={onKey}>
                                {/*<span onClick={() => this.showChangePassword(pubkey)}>&nbsp;{edit}</span>*/}
                            </ShowKey>
                        </span>
                    </div>
                </div>
            </div>
        ))
        return (
            <span>
                <div className="row">
                    <div className="column small-12">
                        <label>{translate(authType.toLowerCase())}</label>
                        {auths}
                    </div>
                </div>
            </span>
        )
    }
}

const emptyMap = Map()

export default connect(
    (state, ownProps) => {
        const {account} = ownProps
        const accountName = account.get('name')
        const current = state.user.get('current')
        const username = current && current.get('username')
        const isMyAccount = username === accountName
        const authLogin = isMyAccount ? {username, password: current.get('password')} : null
        let privateKeys
        if (current)
            privateKeys = current.get('private_keys') // not bound to one account

        if(!privateKeys)
            privateKeys = emptyMap

        const auth = state.user.getIn(['authority', accountName])
        return {...ownProps, auth, authLogin, privateKeys}
    },
    dispatch => ({
        showChangePassword: (username, authType, priorAuthKey) => {
            const name = 'changePassword'
            dispatch(g.actions.remove({key: name}))
            dispatch(g.actions.showDialog({name, params: {username, authType, priorAuthKey}}))
        },
    })
)(Keys)
