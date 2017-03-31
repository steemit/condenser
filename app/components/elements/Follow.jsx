import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import LoadingIndicator from 'app/components/elements/LoadingIndicator';
import shouldComponentUpdate from 'app/utils/shouldComponentUpdate'
import transaction from 'app/redux/Transaction';
import g from 'app/redux/GlobalReducer';
import {Set, Map} from 'immutable'
import { translate } from 'app/Translator';

const {string, bool, any} = PropTypes

export default class Follow extends React.Component {
    static propTypes = {
        following: string,
        follower: string, // OPTIONAL default to current user
        showFollow: bool,
        showMute: bool,
        fat: bool,
        children: any,
    }

    static defaultProps = {
        showFollow: true,
        showMute: true,
        fat: false,
    }

    constructor(props) {
        super()
        this.state = {}
        this.initEvents(props)
        this.shouldComponentUpdate = shouldComponentUpdate(this, 'Follow')
    }

    componentWillUpdate(nextProps) {
        this.initEvents(nextProps)
    }

    initEvents(props) {
        const {updateFollow, follower, following} = props

        /** @param {string} [msg] Confirmation message. */
        const upd = (type, msg) => {
            if(this.state.busy) return;

            const c = !msg || !confirm || confirm(msg)
            if (!c) return

            this.setState({busy: true})
            const done = () => {this.setState({busy: false})}
            updateFollow(follower, following, type, done)
        }
        this.follow = upd.bind(null, 'blog', translate('confirm_follow'))
        this.unfollow = upd.bind(null, null, translate('confirm_unfollow'))
        this.ignore = upd.bind(null, 'ignore', translate('confirm_ignore'))
        this.unignore = upd.bind(null, null, translate('confirm_unignore'))
    }

    render() {
        const {loading} = this.props
        if(loading) return <span><LoadingIndicator /> {translate('loading')}&hellip;</span>
        if(loading !== false) {
            // must know what the user is already following before any update can happen
            return <span></span>
        }

        const {follower, following} = this.props // html
        if(!follower || !following) return <span></span>
        if(follower === following) return <span></span> // Can't follow or ignore self

        const {followingWhat} = this.props // redux
        const {showFollow, showMute, fat, children} = this.props // html
        const {busy} = this.state

        const cnBusy = busy ? 'disabled' : ''
        const cnActive = 'button' + (fat ? '' : ' slim')
        const cnInactive = cnActive + ' hollow secondary ' + cnBusy
        return <span>
            {showFollow && followingWhat !== 'blog' &&
                <label className={cnInactive} onClick={this.follow}>{translate('follow')}</label>}

            {showFollow && followingWhat === 'blog' &&
                <label className={cnInactive} onClick={this.unfollow}>{translate('unfollow')}</label>}

            {showMute && followingWhat !== 'ignore' &&
                <label className={cnInactive} onClick={this.ignore}>{translate('mute')}</label>}

            {showMute && followingWhat === 'ignore' &&
                <label className={cnInactive} onClick={this.unignore}>{translate('unmute')}</label>}

            {children && <span>&nbsp;&nbsp;{children}</span>}
        </span>
    }
}

const emptyMap = Map()
const emptySet = Set()

module.exports = connect(
    (state, ownProps) => {
        let {follower} = ownProps
        if(!follower) {
            const current_user = state.user.get('current')
            follower = current_user ? current_user.get('username') : null
        }

        const {following} = ownProps
        const f = state.global.getIn(['follow', 'get_following', follower], emptyMap)
        const loading = f.get('blog_loading', false) || f.get('ignore_loading', false)
        const followingWhat =
            f.get('blog_result', emptySet).contains(following) ? 'blog' :
            f.get('ignore_result', emptySet).contains(following) ? 'ignore' :
            null

        return {
            follower,
            following,
            followingWhat,
            loading,
        };
    },
    dispatch => ({
        updateFollow: (follower, following, action, done) => {
            const what = action ? [action] : []
            const json = ['follow', {follower, following, what}]
            dispatch(transaction.actions.broadcastOperation({
                type: 'custom_json',
                operation: {
                    id: 'follow',
                    required_posting_auths: [follower],
                    json: JSON.stringify(json),
                },
                successCallback: done,
                errorCallback: done,
            }))
        },
    })
)(Follow)
