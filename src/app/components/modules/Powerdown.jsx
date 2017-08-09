import React from 'react';
import {connect} from 'react-redux'
import g from 'app/redux/GlobalReducer'
import reactForm from 'app/utils/ReactForm'
import Slider from 'react-rangeslider';
import transaction from 'app/redux/Transaction';
import user from 'app/redux/User';
import tt from 'counterpart'
import {numberWithCommas, vestingSteem, vestsToSp} from 'app/utils/StateFunctions'
import { LIQUID_TOKEN, LIQUID_TICKER, DEBT_TOKENS, VESTING_TOKEN } from 'app/client_config';


class Powerdown extends React.Component {

    constructor() {
      super();
      this.state = {
        confirm: false,
        powerDownMax: 8,
        powerDownMin: 0,
        powerDownAmount: 0,
        powerDownPercent: 100
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
          let pdv = e;
          if(pdv > powerDownMax){
            pdv = powerDownMax;
          }
          if(pdv < 0){
            pdv = 0;
          }

          let pwrDwnCalc = parseFloat(100*(pdv/powerDownMax)).toFixed(3);
          this.setState({
            powerDownAmount: parseFloat(pdv.toFixed(3)),
            powerDownPercent: pwrDwnCalc
          });
      };

      const handlePowerDownTextChange= e => {
          let pdv = e.target.value;
          if(pdv > powerDownMax){
            pdv = powerDownMax;
          }
          if(pdv < 0){
            pdv = 0;
          }

          let pwrDwnCalc = parseFloat(100*(pdv/powerDownMax)).toFixed(3);
          this.setState({
            powerDownAmount: parseFloat(pdv.toFixed(3)),
            powerDownPercent: pwrDwnCalc
          });
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
                  <div className="select-powerdown-text">{tt('powerdown_jsx.select_powerdown_amt_VESTING_TOKEN', {VESTING_TOKEN})}</div>
                  <Slider min={powerDownMin} max={powerDownMax} step={0.001} value={parseFloat(this.state.powerDownAmount)} onChange={(e) => handlePowerDownSliderChange(e)} />
                  <div className="select-powerdown-amount">{tt('powerdown_jsx.power_down_amount')}: <input type="text" className="powerdown-amount" onChange={(e) => handlePowerDownTextChange(e)} value={this.state.powerDownAmount} /><b><i>{tt('powerdown_jsx.steem_power', {VESTING_TOKEN})}</i></b></div>
                  <br />
                  <button className="button filled float-right" onClick={(e) => handlePowerDown(e)}>{tt('powerdown_jsx.power_down')}</button>
              </div>
          }
          {!this.state.confirm ? '' :
              <div>
                <div className="powerdown-confirm-text">
                   {tt('powerdown_jsx.confirm_power_down')}
                   <br />
                   {this.state.powerDownPercent}% {tt('powerdown_jsx.of_your', {VESTING_TOKEN})}
                   <br />
                 </div>
                 <button className="button filled float-right" onClick={(e)=> finishPowerDown(e)}>{tt('powerdown_jsx.confirm')}</button>
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
