/* eslint react/prop-types: 0 */
import React from 'react'
import Reveal from 'react-foundation-components/lib/global/reveal';
import CloseButton from 'react-foundation-components/lib/global/close-button';
import TimeAgoWrapper from 'app/components/elements/TimeAgoWrapper';
import {browserHistory} from 'react-router';
import { translate } from 'app/Translator';

class CheckLoginOwner extends React.Component {
    constructor() {
        super()
        this.state = {}
    }
    componentWillReceiveProps(nextProps) {
        const {login_owner_pubkey} = nextProps
        if(login_owner_pubkey && this.props.login_owner_pubkey !== login_owner_pubkey)
            this.props.lookupPreviousOwnerAuthority()

        const {previous_owner_authority} = nextProps
        if(previous_owner_authority && this.props.previous_owner_authority !== previous_owner_authority) {
            const last_valid_time = previous_owner_authority.get('last_valid_time')
            // has this been shown already?
            if(localStorage[this.getKey(nextProps)] !== last_valid_time) {
                let last_valid_date
                if(!/Z$/.test(last_valid_time))
                    last_valid_date = last_valid_time + 'Z'
                last_valid_date = new Date(last_valid_date)

                this.setState({last_valid_time, last_valid_date})
            }
        }
    }
    hide = () => {
        const {understood} = this.state
        if(understood) {
            const {last_valid_time} = this.state
            localStorage[this.getKey()] = last_valid_time
        }
        this.setState({last_valid_time: null, last_valid_date: null})
    }
    getKey = (props = this.props) => {
        const {previous_owner_authority} = props
        const username = previous_owner_authority.get('account')
        const key = `${username}_previous_owner_authority_last_valid_time`
        return key
    }
    recover = () => {
        this.hide()
        browserHistory.push('/recover_account_step_1')
    }
    onUnderstood = e => {
        const understood = e.target.checked
        console.log('understood', understood)
        this.setState({understood})
    }
    render() {
        const {last_valid_time, last_valid_date} = this.state
        if(!last_valid_time) return <span></span>
        const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000
        const deadline = last_valid_date.getTime() + THIRTY_DAYS

        // https://steemit.com/steem/@originate/steem-s-new-alert-after-key-updates-is-excellent-but-here-s-a-quick-update-that-would-make-it-even-better
        // "If you recently reset your password at(timestamp in strftime, example:  Thu, 21 Jul 2016 02:39:19 PST) this alert was most likely prompted by this action, otherwise your immediate attention is needed"
        return <span>
            <Reveal show>
                <CloseButton onClick={this.hide} />
                <h3>{translate('account_updated')}</h3>
                <p>
                    <span className="warning uppercase">{translate('warning')}:</span> {translate('your_password_permissions_were_reduced')} <TimeAgoWrapper date={last_valid_time} />. {translate('if_you_did_not_make_this_change') + ' '} <a onClick={this.recover}>{translate('recover_your_account')}</a>.
                </p>
                <p>
                    {translate('owhership_changed_on')}: {last_valid_date.toString()}
                </p>
                <p>
                    {translate('deadline_for_recovery_is' + ' ')} <u><TimeAgoWrapper date={deadline} /></u>.
                </p>
                <p>
                    <input type="checkbox" onChange={this.onUnderstood} />&nbsp;&nbsp;
                    {translate('i_understand_dont_show_again')}.
                </p>
                <div className="button" onClick={this.hide}>{translate('ok')}</div>
            </Reveal>
        </span>
    }
}
import {connect} from 'react-redux'
export default connect(
    // mapStateToProps
    (state, ownProps) => {
        const current = state.user.get('current')
        const login_owner_pubkey = current && current.get('login_owner_pubkey')
        const previous_owner_authority = current && current.get('previous_owner_authority')
        return {
            ...ownProps,
            login_owner_pubkey,
            previous_owner_authority,
        }
    },
    // mapDispatchToProps
    dispatch => ({
        lookupPreviousOwnerAuthority: () => {
            dispatch({type: 'user/lookupPreviousOwnerAuthority', payload: {}})
        },
    })
)(CheckLoginOwner)
