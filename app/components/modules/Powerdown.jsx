import React from 'react';
import {connect} from 'react-redux'
import g from 'app/redux/GlobalReducer'
import reactForm from 'app/utils/ReactForm'
import Slider from 'react-rangeslider';
import transaction from 'app/redux/Transaction';
import user from 'app/redux/User';
import tt from 'counterpart'
import {numberWithCommas, vestingSteem, vestsToSp} from 'app/utils/StateFunctions'

class Powerdown extends React.Component {

    constructor() {
      super();
      this.state = {
        confirm: false,
        powerDownMax: 8,
        powerDownMin: 0,
        powerDownAmount: 0
      };
    }

    render() {
      const {account} = this.props;
      const gprops = this.props.gprops.toJS();

      let powerdown_vests = parseFloat(this.props.powerdown_vests);
      this.state.powerDownAmount = this.state.powerDownAmount || powerdown_vests;

      let vesting_steem = account.get('vesting_shares');
      let powerDownMin = 0;
      let powerDownMax = parseFloat(powerdown_vests.toFixed(3));
      const handlePowerDownSliderChange= e => {
          //let pwrDwnCalc = parseFloat(account.get('vesting_shares')) * (this.state.powerDownAmount / powerDownMax);
          this.setState({powerDownAmount: parseFloat(e.toFixed(3))});
      };

      const cancelPowerDown = e => {
        this.setState({
          show_powerdown_modal: false
        });
      }

      const handlePowerDown = e => {
        e.preventDefault();
        const VEST_TICKER = 'VESTS';
        const name = account.get('name');
        this.setState({
          toggleDivestError: null,
          confirm: true
        });
      };

      const finishPowerDown = e => {
        e.preventDefault();
        const pwrDwnCalc = parseFloat(account.get('vesting_shares')) * (this.state.powerDownAmount / powerDownMax);
        const vesting_shares = pwrDwnCalc.toFixed(6) + ' VESTS';
        const VEST_TICKER = 'VESTS';
        const name = account.get('username');
        this.setState({toggleDivestError: null});
        const errorCallback = e2 => {this.setState({toggleDivestError: e2.toString()})};
        const successCallback = this.props.successCallback;

        this.props.withdrawVesting({account: name, vesting_shares, errorCallback, successCallback});
      };

      const cancelPowerdown = (e) => {
        this.setState({
          toggleDivestError: null,
          show_powerdown_modal: false
        });
      };

      return (
        <div>
          <div><h3>{tt('powerdown_jsx.power_down')}</h3></div>
          {this.state.confirm ? '' :
              <div>
                 <Slider min={powerDownMin} max={powerDownMax} step={0.001} value={parseFloat(this.state.powerDownAmount)} onChange={(e) => handlePowerDownSliderChange(e)} />
                 <div className="powerdown-amount">{tt('powerdown_jsx.power_down_amount')}: {this.state.powerDownAmount.toFixed(3)}</div>
                 <br />
                 <button className="button hollow float-right" onClick={(e) => handlePowerDown(e)}>{tt('powerdown_jsx.power_down')}</button>
              </div>
          }
          {!this.state.confirm ? '' :
               <div className="powerdown-confirm-text">
                   {tt('powerdown_jsx.confirm_power_down')}?
                   <br />
                   <button className="button hollow float-right" onClick={(e)=> finishPowerDown(e)}>{tt('powerdown_jsx.confirm')}</button>
               </div>
          }
         </div>
        );
     }
}

export default connect(
    // mapStateToProps
    (state, ownProps) => {
        const account = state.user.get('current');
        const gprops = state.global.get('props');
        let powerdown_vests = numberWithCommas(vestsToSp(state, account.get('vesting_shares') + ' VESTS'));

        return {
            ...ownProps,
            state,
            account,
            gprops,
            powerdown_vests
        };
    },
    // mapDispatchToProps
    dispatch => ({
        successCallback: () => {
            dispatch(user.actions.hidePowerdown())
        },
        powerDown: (e) => {
            e.preventDefault()
            const name = 'powerDown';
            dispatch(g.actions.showDialog({name}))
        },
        withdrawVesting: ({account, vesting_shares, errorCallback, successCallback}) => {
            const successCallbackWrapper = (...args) => {
                dispatch({type: 'global/GET_STATE', payload: {url: `@${account}/transfers`}})
                return successCallback(...args)
            }
            dispatch(transaction.actions.broadcastOperation({
                type: 'withdraw_vesting',
                operation: {account, vesting_shares},
                errorCallback,
                successCallback: successCallbackWrapper,
            }))
        },
    })
)(Powerdown)
