import React, {PropTypes, Component} from 'react';
import shouldComponentUpdate from 'app/utils/shouldComponentUpdate';
import g from 'app/redux/GlobalReducer';
import {connect} from 'react-redux';
import tt from 'counterpart';

class UserInvites extends Component {
    static propTypes = {
        // HTML
        account: PropTypes.object.isRequired,
        // Redux
        isMyAccount: PropTypes.bool.isRequired,
        accountName: PropTypes.string.isRequired,
    }

    constructor() {
        super()
        this.shouldComponentUpdate = shouldComponentUpdate(this, 'PasswordReset')
    }

    render() {
        const {accountName} = this.props

        return (<div className="row">
          <div className="column small-12">
            <h4>{tt('g.invited_users')}</h4>
            <table>
              <tbody>
                {''}
              </tbody>
           </table>
          </div>
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
        return {...ownProps, isMyAccount, accountName}
    },
    dispatch => ({
    })
)(UserInvites)
