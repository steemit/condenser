import React, {PropTypes, Component} from 'react';
import shouldComponentUpdate from 'app/utils/shouldComponentUpdate';
import {connect} from 'react-redux';
import tt from 'counterpart';

/** Display a public key.  Offer to show a private key, but only if it matches the provided public key */
class ShowKey extends Component {
    static propTypes = {
        // HTML props
        pubkey: PropTypes.string.isRequired,
        authType: PropTypes.string.isRequired,
        accountName: PropTypes.string.isRequired,
        showLogin: PropTypes.func.isRequired,
        privateKey: PropTypes.object,
        cmpProps: PropTypes.object,
        children: PropTypes.object,
        onKey: PropTypes.func,
    }
    constructor() {
        super()
        this.state = {}
        this.shouldComponentUpdate = shouldComponentUpdate(this, 'ShowKey')
        this.onShow = () => {
            const {state: {show, wif}} = this
            const {onKey, pubkey} = this.props
            this.setState({show: !show})
            if(onKey) onKey(!show ? wif : null, pubkey)
        }
        this.showLogin = () => {
            const {showLogin, accountName, authType} = this.props
            showLogin({username: accountName, authType})
        }
        this.showLogin = this.showLogin.bind(this)
    }
    componentWillMount() {
        this.setWif(this.props, this.state)
        this.setOnKey(this.props, this.state)
    }
    componentWillReceiveProps(nextProps) {
        this.setWif(nextProps)
    }
    componentWillUpdate(nextProps, nextState) {
        this.setOnKey(nextProps, nextState)
    }
    setWif(props) {
        const {privateKey, pubkey} = props
        if (privateKey && pubkey === privateKey.toPublicKey().toString()) {
            const wif = privateKey.toWif()
            this.setState({wif})
        } else {
            this.setState({wif: undefined})
        }
    }
    setOnKey(nextProps, nextState) {
        const {show, wif} = nextState
        const {onKey, pubkey} = nextProps
        if(onKey) onKey((show ? wif : null), pubkey)
    }
    showQr = () => {
        const {show, wif} = this.state;
        this.props.showQRKey({type: this.props.authType, text: show ? wif : this.props.pubkey, isPrivate: show});
    }
    render() {
        const {onShow, showLogin, props: {pubkey, cmpProps, children, authType}} = this
        const {show, wif} = this.state

        const keyIcon = <span style={{fontSize: '100%'}}>{tt('g.hide_private_key')}</span>
        // Tooltip is trigggering a setState on unmounted component exception
        const showTip = tt('g.show_private_key')//<Tooltip t="Show private key (WIF)">show</Tooltip>


        const keyLink = wif ?
            <div style={{marginBottom: 0}} className="hollow tiny button slim"><a onClick={onShow}>{show ? keyIcon : showTip}</a></div> :
            authType === 'memo' ? null :
            authType === 'owner' ? null :

            <div style={{marginBottom: 0}} className="hollow tiny button slim"><a onClick={showLogin}>{tt('g.login_to_show')}</a></div>;


        return (<div className="row">
            <div className="column small-12 medium-10">
                <div style={{display: "inline-block", paddingRight: 10, cursor: "pointer"}} onClick={this.showQr}>
                    <img src={require("app/assets/images/qrcode.png")} height="40" width="40" />
                </div>
                {/* Keep this as wide as possible, check print preview makes sure WIF it not cut off */}
                <span {...cmpProps}>{show ? wif : pubkey}</span>
            </div>
            <div className="column small-12 medium-2 noPrint">
                {keyLink}
            </div>
            {/*<div className="column small-1">
                {children}
            </div>*/}
        </div>)
    }
}
export default connect(
    (state, ownProps) => ownProps,
    dispatch => ({
        showLogin: ({username, authType}) => {
            dispatch({type: 'user/SHOW_LOGIN', payload: {loginDefault: {username, authType}}})
        },
        showQRKey: ({type, isPrivate, text}) => {
            dispatch({type: 'global/SHOW_DIALOG', payload: {name: "qr_key", params: {type, isPrivate, text}}});
        }
    })
)(ShowKey)
