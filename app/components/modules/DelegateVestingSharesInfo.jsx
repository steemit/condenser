import React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import tt from 'counterpart'
import g from 'app/redux/GlobalReducer'
import { LIQUID_TICKER, VESTING_TOKEN } from 'app/client_config'
import LoadingIndicator from 'app/components/elements/LoadingIndicator'
import { numberWithCommas, vestsToSteem } from 'app/utils/StateFunctions'

class DelegateVestingSharesInfo extends React.Component {

    componentDidMount() {
        const { account, type, fetchVestingDelegations } = this.props
        fetchVestingDelegations(account, type)
    }

    render() {
        const { type, delegated_vesting, gprops } = this.props
        
        if (!delegated_vesting)
            return <center><LoadingIndicator type="circle" /></center>

        const delegatedVesting = delegated_vesting.toJS()

        const rows = Object.keys(delegatedVesting).map(k => {
            const c = delegatedVesting[k]
            const vestingShares = vestsToSteem(c.vesting_shares, gprops)
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
            </tr>
        })

        return (
            <div>
                <div className="row">
                    <h5>{tt(`g.${type}_vesting`, { VESTING_TOKEN })}</h5>
                </div>
                <div className="row">
                    <table style={{ marginTop: '1rem'}}>
                        <thead>
                            <tr>
                                <td>{type === 'delegated' ? tt('g.to') : tt('g.from')}</td>
                                <td>{VESTING_TOKEN}</td>
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

        return {
            ...ownProps,
            delegated_vesting,
            gprops
        }
    },

    dispatch => ({
        fetchVestingDelegations: (account, type) => {
            dispatch({ type: 'global/FETCH_VESTING_DELEGATIONS', payload: { account, type } })
        },

        hideDialog: () => {
            dispatch(g.actions.hideDialog({ name: 'delegate_vesting_info' }))
        }
    })
)(DelegateVestingSharesInfo)
