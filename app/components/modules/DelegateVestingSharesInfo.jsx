import React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import tt from 'counterpart'
import g from 'app/redux/GlobalReducer'
import { LIQUID_TICKER } from 'app/client_config'
import transaction from 'app/redux/Transaction'
import LoadingIndicator from 'app/components/elements/LoadingIndicator'
import { numberWithCommas, vestsToGolos } from 'app/utils/StateFunctions'

class DelegateVestingSharesInfo extends React.Component {

    componentDidMount() {
        const { account, type, fetchVestingDelegations } = this.props
        fetchVestingDelegations(account, type)
    }

    cancelDelegateVesting = (e, delegatee) => {
        e.preventDefault()
        const { account, cancelDelegation, hideDialog } = this.props
        
        const success = () => hideDialog()
        
        cancelDelegation(account, delegatee, success)
    }

    render() {
        const { type, delegated_vesting, gprops, currentUser, account } = this.props
        
        if (!delegated_vesting)
            return <center><LoadingIndicator type="circle" /></center>

        let isMyAccount = currentUser === account
        const delegatedVesting = delegated_vesting.toJS()

        const rows = Object.keys(delegatedVesting).map(k => {
            const c = delegatedVesting[k]
            const vestingShares = vestsToGolos(c.vesting_shares, gprops)
            const vestingShares_str = `${numberWithCommas(vestingShares)} ${LIQUID_TICKER}`

            return <tr key={k}>
                {type === 'delegated' 
                    ? (
                        <td>
                            <Link
                                to={`/@${c.delegatee}`}
                                onClick={() => this.props.hideDialog()}
                            >{c.delegatee}</Link>
                        </td>
                      )
                    : (
                        <td>         
                            <Link
                                to={`/@${c.delegator}`}
                                onClick={() => this.props.hideDialog()}
                            >{c.delegator}</Link>
                        </td>
                      )  
                }
                <td>
                    {vestingShares_str}
                </td>
                {type === 'delegated' && isMyAccount && (
                    <td style={{textAlign: 'center'}}>
                        <a
                            href="#"
                            onClick={e => 
                                this.cancelDelegateVesting(e, c.delegatee)
                            }
                        >
                            x
                        </a>
                    </td>
                )}
            </tr>
        })

        return (
            <div>
                <div className="row">
                    <h5>{tt(`g.${type}_vesting`, { VESTING_TOKEN: tt('token_names.VESTING_TOKEN') })}</h5>
                </div>
                <div className="row">
                    <table style={{ marginTop: '1rem'}}>
                        <thead>
                            <tr>
                                <td>{type === 'delegated'
                                    ? tt('delegate_vesting_shares_info_jsx.to')
                                    : tt('delegate_vesting_shares_info_jsx.from')}
                                </td>
                                <td>{tt('token_names.VESTING_TOKEN')}</td>
                                {type === 'delegated' && isMyAccount && <td style={{textAlign: 'center'}}>{tt('g.cancel')}</td>}
                            </tr>
                        </thead>
                        <tbody>
                            {rows}
                        </tbody>
                    </table>
                </div>
            </div>
        )
    }
}

export default connect(

    (state, ownProps) => {
        const { account, type } = ownProps
        const delegated_vesting = state.global.getIn([ 'accounts', account, `${type}_vesting` ])
        const gprops = state.global.get('props').toJS()
        const current_user = state.user.get('current')

        return {
            ...ownProps,
            delegated_vesting,
            gprops,
            currentUser: current_user ? current_user.get('username') : null
        }
    },

    dispatch => ({
        fetchVestingDelegations: (account, type) => {
            dispatch({ type: 'global/FETCH_VESTING_DELEGATIONS', payload: { account, type } })
        },

        cancelDelegation: (delegator, delegatee, success) => {

            const confirm = tt(
                'delegate_vesting_shares_info_jsx.confirm_cancel_delegation',
                { VESTING_TOKEN2: tt('token_names.VESTING_TOKEN2'), delegatee }
            )

            const successCallback = () => {
                dispatch({ type: 'FETCH_STATE', payload: { pathname: `@${delegator}/transfers` } })
                success();
            }

            dispatch(transaction.actions.broadcastOperation({
                type: 'delegate_vesting_shares',
                operation: {
                    delegator,
                    delegatee,
                    vesting_shares: '0.000000 GESTS',
                    __config: { title: tt('delegate_vesting_shares_info_jsx.confirm_title', { VESTING_TOKENS: tt('token_names.VESTING_TOKENS') }) }
                },
                confirm,
                successCallback
            }))
        },

        hideDialog: () => {
            dispatch(g.actions.hideDialog({ name: 'delegate_vesting_info' }))
        }
    })
)(DelegateVestingSharesInfo)
