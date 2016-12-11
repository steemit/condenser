import React, {PropTypes, Component} from 'react'
import LoadingIndicator from 'app/components/elements/LoadingIndicator'
import {reduxForm} from 'redux-form' // @deprecated, instead use: app/utils/ReactForm.js
import {PrivateKey} from 'shared/ecc'
import {cleanReduxInput} from 'app/utils/ReduxForms'
import { translate } from 'app/Translator';

class KeyEdit extends Component {
    static propTypes = {
        // HTML
        authType: PropTypes.string.isRequired,
        onKeyChanged: PropTypes.func.isRequired,
        onCancel: PropTypes.func,
        accountChanged: PropTypes.bool.isRequired,

        // Redux form
        oldAuth: PropTypes.string.isRequired,
        fields: PropTypes.shape({
            password: PropTypes.object.isRequired,
            confirm: PropTypes.object.isRequired,
        }),
        handleSubmit: PropTypes.func.isRequired,
        submitting: PropTypes.bool.isRequired,
        error: PropTypes.string,
    }
    constructor() {
        super()
        this.state = {}
        this.onCancel = e => {
            e.preventDefault()
            if (this.props.onCancel)
                this.props.onCancel()
        }
        this.onCancel = this.onCancel.bind(this)

        this.onKeyChanged = data => {
            const {onKeyChanged, oldAuth} = this.props
            return onKeyChanged({...data, oldAuth})
        }
        this.onKeyChanged = this.onKeyChanged.bind(this)
    }
    componentDidMount() {
        setTimeout(() => { this.refs.key.focus() }, 300)
    }
    componentWillReceiveProps(nextProps) {
        const {fields: {password, confirm}} = nextProps
        let isWif
        try {
            PrivateKey.fromWif(password.value)
            // A WIF has a checksum, it does not need a confirmation
            if (confirm.value !== password.value)
                confirm.onChange(password.value)
            isWif = true
        } catch (e) {
            isWif = false
        }
        this.setState({isWif})
    }
    render() {
        const {
            onCancel, onKeyChanged, // see constructor
            props: {
                authType, accountChanged,
                handleSubmit, submitting, error,
                fields: {password, confirm},
            },
            state: {isWif},
        } = this
        return (
            <form onSubmit={handleSubmit(data => onKeyChanged(data))}>
                <div className="row">
                    <div className={'column small-12' + (password.touched && password.error ? ' error' : '')}>
                        <label>Change “{authType}” Key (Password or WIF)</label>
                        <input ref="key" type="password" {...cleanReduxInput(password)}
                            placeholder="Password or WIF" autoComplete="off" />
                        <span className="error">{password.touched && password.error && password.error}&nbsp;</span>
                    </div>
                    <div className={'column small-12' + (confirm.touched && confirm.error ? ' error' : '')}>
                        <label>{translate('confirm_password')}</label>
                        <input ref="keyConfirm" type="password" {...cleanReduxInput(confirm)} disabled={isWif}
                            placeholder="Confirm Password" autoComplete="off" />
                        <div className="error">{confirm.touched && confirm.error && confirm.error}&nbsp;</div>
                    </div>
                    <div className="column small-12">
                        {error && <div className="error">{error}</div>}
                        {submitting && <LoadingIndicator type="circle" />}
                        {accountChanged && <span>
                            <div className="success">{translate('account_updated')}</div>
                            <br />
                            <button className="button" type="button" onClick={onCancel}>
                                {translate('close')}
                            </button>
                        </span>}
                        {!accountChanged && <span>
                            <button className="button" type="submit" disabled={submitting}>
                                {translate('save')}
                            </button>
                            <button className="button" type="button" disabled={submitting} onClick={onCancel}>
                                {translate('cancel')}
                            </button>
                        </span>}
                    </div>
                </div>
            </form>
        )
    }
}

import {PublicKey} from 'shared/ecc'

const keyValidate = values => ({
    password: ! values.password ? translate('required') :
        values.password.length < 32 ? translate('password_must_be_characters_or_more', {amount: 32}) :
        PublicKey.fromString(values.password) ? translate('need_password_or_key') :
        null,
    confirm: values.confirm !== values.password ? translate('passwords_do_not_match') : null,
})

export default reduxForm(
    //config
    { form: 'KeyEdit', fields: ['password', 'confirm'], validate: keyValidate},
    (state, ownProps) => {
        const {oldAuth} = ownProps
        const private_keys = state.user.getIn(['current', 'private_keys'])
        const privateKey = private_keys && private_keys.find(d => d.toPublicKey().toString() === oldAuth)
        return {...ownProps, privateKey, oldAuth}
    },
)(KeyEdit)
