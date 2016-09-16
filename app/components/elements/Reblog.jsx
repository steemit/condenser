import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
// import LoadingIndicator from 'app/components/elements/LoadingIndicator';
import shouldComponentUpdate from 'app/utils/shouldComponentUpdate'
import transaction from 'app/redux/Transaction';
import Icon from 'app/components/elements/Icon';

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
        this.state = {active: this.isReblogged(), loading: false}
        this.reblog = e => {
            e.preventDefault()
            if(this.state.active) return
            this.setState({loading: true})
            const {reblog, account, author, permlink} = this.props
            reblog(account, author, permlink,
                () => {this.setState({active: true, loading: false})
                       this.setReblogged()},
                () => {this.setState({active: false, loading: false})},
            )
        }
    }

    getRebloggedList() {
        let posts = localStorage.getItem("reblogged")
        try {
            posts = JSON.parse(posts) || []
        } catch(e) {
            posts = []
        }
        return posts
    }
    isReblogged() {
        return this.getRebloggedList().includes(this.props.author + '/' + this.props.permlink)
    }
    setReblogged() {
       let posts = this.getRebloggedList()
       posts.push(this.props.author + '/' + this.props.permlink)
       localStorage.setItem("reblogged", JSON.stringify(posts))
    }

    render() {
        const state = this.state.active ? 'active' : 'inactive'
        const loading = this.state.loading ? ' loading' : ''
        return <span className={'Reblog__button Reblog__button-'+state + loading}>
            <a href="#" onClick={this.reblog} title="Reblog"><Icon name="reblog" /></a>
        </span>
    }
}
module.exports = connect(
    (state, ownProps) => {
        let {account} = ownProps
        if(!account) {
            const current_user = state.user.get('current')
            account = current_user ? current_user.get('username') : null
        }
        return {...ownProps, account}
    },
    dispatch => ({
        reblog: (account, author, permlink, successCallback, errorCallback) => {
            const json = ['reblog', {account, author, permlink}]
            dispatch(transaction.actions.broadcastOperation({
                type: 'custom_json',
                operation: {
                    id: 'follow',
                    required_posting_auths: [account],
                    json: JSON.stringify(json),
                },
                successCallback, errorCallback,
            }))
        },
    })
)(Reblog)
