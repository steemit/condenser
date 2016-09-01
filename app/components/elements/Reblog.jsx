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
    constructor() {
        super()
        this.shouldComponentUpdate = shouldComponentUpdate(this, 'Reblog')
        this.state = {active: false} // may need a "loading" flag
        this.reblog = e => {
            e.preventDefault()
            const {account, author, permlink, reblog} = this.props
            reblog(account, author, permlink)
            this.setState({active: true})
        }
    }

    render() {
        const state = this.state.active ? 'active' : 'inactive'
        return <span className={'Reblog__button Reblog__button-'+state}>
            <a href="#" onClick={this.reblog}><Icon name="reblog" /></a>
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
        reblog: (account, author, permlink) => {
            const json = ['reblog', {account, author, permlink}]
            dispatch(transaction.actions.broadcastOperation({
                type: 'custom_json',
                operation: {
                    id: 'reblog',
                    required_posting_auths: [account],
                    json: JSON.stringify(json),
                },
            }))
        },
    })
)(Reblog)
