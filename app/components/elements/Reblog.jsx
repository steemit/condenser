import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
// import LoadingIndicator from 'app/components/elements/LoadingIndicator';
import shouldComponentUpdate from 'app/utils/shouldComponentUpdate'
import transaction from 'app/redux/Transaction';
import Icon from 'app/components/elements/Icon';
import { translate } from 'app/Translator';

const {string, func} = PropTypes

export default class Reblog extends React.Component {
    static propTypes = {
        account: string,
        author: string,
        permlink: string,
        reblog: func,
    }
    constructor(props) {
        super(props)
        this.shouldComponentUpdate = shouldComponentUpdate(this, 'Reblog')
        this.state = {active: false, loading: false}
    }

    componentWillMount() {
        const {account} = this.props
        if(account) {
            this.setState({active: this.isReblogged(account)})
        }
    }

    componentWillReceiveProps(nextProps) {
        if(nextProps.account) {
            this.setState({active: this.isReblogged(nextProps.account)})
        }
    }

    reblog = e => {
        e.preventDefault()
        if(this.state.active) return
        this.setState({loading: true})
        const {reblog, account, author, permlink} = this.props
        reblog(account, author, permlink,
            () => {this.setState({active: true, loading: false})
                   this.setReblogged(account)},
            () => {this.setState({active: false, loading: false})},
        )
    }

    isReblogged(account) {
        const {author, permlink} = this.props
        return getRebloggedList(account).includes(author + '/' + permlink)
    }

    setReblogged(account) {
        const {author, permlink} = this.props
        clearRebloggedCache()
        let posts = getRebloggedList(account)
        posts.push(author + '/' + permlink)
        if(posts.length > 200)
            posts.shift(1)

        localStorage.setItem("reblogged_" + account, JSON.stringify(posts))
    }

    render() {
        if(this.props.author == this.props.account) return null;

        const state = this.state.active ? 'active' : 'inactive'
        const loading = this.state.loading ? ' loading' : ''
        return <span className={'Reblog__button Reblog__button-'+state + loading}>
            <a href="#" onClick={this.reblog} title={translate('reblog')}><Icon name="reblog" /></a>
        </span>
    }
}
module.exports = connect(
    (state, ownProps) => {
        const account = state.user.getIn(['current', 'username']) || state.offchain.get('account')
        return {...ownProps, account}
    },
    dispatch => ({
        reblog: (account, author, permlink, successCallback, errorCallback) => {
            const json = ['reblog', {account, author, permlink}]
            dispatch(transaction.actions.broadcastOperation({
                type: 'custom_json',
                confirm: translate('are_you_sure'),
                operation: {
                    id: 'follow',
                    required_posting_auths: [account],
                    json: JSON.stringify(json),
                    __config: {title: translate('resteem_this_post')}
                },
                successCallback, errorCallback,
            }))
        },
    })
)(Reblog)

let lastAccount
let cachedPosts

function getRebloggedList(account) {
    if(!process.env.BROWSER)
        return []

    if(lastAccount === account)
        return cachedPosts

    lastAccount = account
    const posts = localStorage.getItem("reblogged_" + account)
    try {
        cachedPosts = JSON.parse(posts) || []
    } catch(e) {
        cachedPosts = []
    }
    return cachedPosts
}

function clearRebloggedCache() {
    lastAccount = null
}
