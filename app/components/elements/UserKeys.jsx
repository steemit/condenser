import React, {PropTypes, Component} from 'react'
import shouldComponentUpdate from 'app/utils/shouldComponentUpdate'
import Keys from 'app/components/elements/Keys'
import g from 'app/redux/GlobalReducer'
import {connect} from 'react-redux';
import QRCode from 'react-qr'

const keyTypes = ['Posting', 'Active', 'Owner', 'Memo']

export default class UserKeys extends Component {
    static propTypes = {
        // HTML
        account: PropTypes.object.isRequired,
        // Redux
        isMyAccount: PropTypes.bool.isRequired,
        wifShown: PropTypes.bool,
        setWifShown: PropTypes.func.isRequired,
        accountName: PropTypes.string.isRequired,
        showChangePassword: PropTypes.func.isRequired,
    }
    constructor() {
        super()
        this.shouldComponentUpdate = shouldComponentUpdate(this, 'UserKeys')
        this.state = {}
        this.onKey = {}
        keyTypes.forEach(key => {
            this.onKey[key] = (wif, pubkey) => {
                this.setState({[key]: {wif, pubkey}})
            }
        })
    }
    componentWillUpdate(nextProps, nextState) {
        const {wifShown, setWifShown} = nextProps
        let hasWif = false
        keyTypes.forEach(key => {
            const keyObj = nextState[key]
            if(keyObj && keyObj.wif) hasWif = true
        })
        if(wifShown !== hasWif)
            setWifShown(hasWif)
    }
    showChangePassword = () => {
        this.props.showChangePassword(this.props.accountName)
    }
    render() {
        const {props: {account, isMyAccount}} = this
        const {onKey} = this
        let idx = 0
        const wifQrs = !isMyAccount ? null : keyTypes.map(key => {
            const keyObj = this.state[key]
            if(!keyObj) return null
            return <span key={idx++}>
                <hr />
                <div className="row">
                    <div className="column small-2">
                        <label>Public</label>
                        <QRCode text={keyObj.pubkey} />
                    </div>
                    <div className="column small-8">
                        <label>Public {key} Key</label>
                        <div className="overflow-ellipsis">
                            <code><small>{keyObj.pubkey}</small></code>
                        </div>
                        {keyObj.wif && <div>
                            <label>Private {key} Key</label>
                            <div className="overflow-ellipsis">
                                <code><small>{keyObj.wif}</small></code>
                            </div>
                        </div>}
                    </div>
                    {keyObj.wif && <div className="column small-2">
                        <label>Private</label>
                        <QRCode text={keyObj.wif} />
                    </div>}
                </div>
            </span>
        })
        return (<div className="row">
            <div style={{paddingBottom: 10}} className="column small-12">
                <Keys account={account} authType="posting" onKey={onKey.Posting} />
                <span className="secondary">The posting key is used for posting and voting. It should be different from the active and owner keys.</span>
            </div>
            <div style={{paddingBottom: 10}} className="column small-12">
                <Keys account={account} authType="active" onKey={onKey.Active} />
                <span className="secondary">The active key is used to make transfers and place orders in the internal market.</span>
            </div>
            <div style={{paddingBottom: 10}} className="column small-12">
                <Keys account={account} authType="owner" onKey={onKey.Owner} />
                <span className="secondary">The owner key is the master key for the account and is required to change the other keys.<br/>The private key or password for the owner key should be kept offline as much as possible.</span>
            </div>
            <div style={{paddingBottom: 10}} className="column small-12">
                <Keys account={account} authType="memo" onKey={onKey.Memo} />
                <span className="secondary">The memo key is used to create and read memos.</span>
            </div>
            {/*
            <div className="column small-12">
                {wifQrs && <span>
                    {wifQrs}
                </span>}
            </div>*/}
        </div>)
    }
}
export default connect(
    (state, ownProps) => {
        const {account} = ownProps
        const accountName = account.get('name')
        const current = state.user.get('current')
        const username = current && current.get('username')
        const isMyAccount = username === accountName
        const wifShown = state.global.get('UserKeys_wifShown')
        return {...ownProps, isMyAccount, wifShown, accountName}
    },
    dispatch => ({
        setWifShown: (shown) => {
            dispatch(g.actions.receiveState({UserKeys_wifShown: shown}))
        },
        showChangePassword: (username) => {
            const name = 'changePassword'
            dispatch(g.actions.remove({key: name}))
            dispatch(g.actions.showDialog({name, params: {username}}))
        },
    })
)(UserKeys)
