import React from 'react';
import { connect } from 'react-redux';
import Slider from 'react-rangeslider';
import tt from 'counterpart';
import g from 'app/redux/GlobalReducer';
import user from 'app/redux/User';
import transaction from 'app/redux/Transaction'
import { VEST_TICKER, LIQUID_TICKER, VESTING_TOKEN } from 'app/client_config';
import {
    numberWithCommas,
    vestsToGolosPower,
    assetFloat,
    vestsToGolos
} from 'app/utils/StateFunctions';

class Powerdown extends React.Component {
    constructor(props, context) {
        super(props, context);
        let new_withdraw;
        if (props.to_withdraw - props.withdrawn > 0) {
            new_withdraw = props.to_withdraw - props.withdrawn;
        } else {
            new_withdraw = props.available_shares;
        }
        this.state = {
            broadcasting: false,
            manual_entry: false,
            new_withdraw,
        };
    }

    render() {
        const {
            account,
            withdrawn,
            to_withdraw,
            vesting_shares,
            delegated_vesting_shares,
        } = this.props;
        const {
            broadcasting,
            new_withdraw,
            manual_entry
        } = this.state;

        const formatSp = amount =>
            numberWithCommas(vestsToGolos(`${amount} ${VEST_TICKER}`, this.props.gprops));

        const sliderChange = value => {
            this.setState({ new_withdraw: value, manual_entry: false });
        };

        const inputChange = event => {
            event.preventDefault();
            let value = vestsToGolosPower(
                this.props.state,
                parseFloat(event.target.value.replace(/,/g, ''))
            );
            if (!isFinite(value)) {
                value = new_withdraw;
            }
            this.setState({
                new_withdraw: value,
                manual_entry: event.target.value,
            });
        };

        const powerDown = event => {
            event.preventDefault();
            this.setState({ broadcasting: true, error_message: undefined });
            const successCallback = this.props.successCallback;
            const errorCallback = error => {
                this.setState({
                    broadcasting: false,
                    error_message: String(error),
                });
            };
            // workaround bad math in react-rangeslider
            let withdraw = new_withdraw;
            if (withdraw > vesting_shares - delegated_vesting_shares) {
                withdraw = vesting_shares - delegated_vesting_shares;
            }
            const vesting_shares = `${withdraw.toFixed(6)} ${VEST_TICKER}`;
            this.props.withdrawVesting({
                account,
                vesting_shares,
                errorCallback,
                successCallback,
            });
        };

        const notes = [];
        if (to_withdraw - withdrawn > 0) {
            const AMOUNT = formatSp(to_withdraw);
            const WITHDRAWN = formatSp(withdrawn);
            notes.push(
                <li key="already_power_down">
                    {tt('powerdown_jsx.already_power_down', {
                        AMOUNT,
                        WITHDRAWN,
                        LIQUID_TICKER,
                    })}
                </li>
            );
        }
        if (delegated_vesting_shares !== 0) {
            const AMOUNT = formatSp(delegated_vesting_shares);
            notes.push(
                <li key="delegating">
                    {tt('powerdown_jsx.delegating', { AMOUNT, LIQUID_TICKER })}
                </li>
            );
        }
        if (notes.length === 0) {
            let AMOUNT =  vestsToGolos(`${new_withdraw} ${VEST_TICKER}`, this.props.gprops) / 13
            AMOUNT = AMOUNT.toFixed(AMOUNT >= 10 ? 0 : 1);
            notes.push(
                <li key="per_week">
                    {tt('powerdown_jsx.per_week', { AMOUNT, LIQUID_TICKER })}
                </li>
            );
        }

        if (this.state.error_message) {
            const MESSAGE = this.state.error_message;
            notes.push(
                <li key="error" className="error">
                    {tt('powerdown_jsx.error', { MESSAGE })}
                </li>
            );
        }

        return (
            <div className="PowerdownModal">
                <div className="row">
                    <h3 className="column">
                        {tt('powerdown_jsx.power_down')} {broadcasting}
                    </h3>
                </div>
                <Slider
                    value={new_withdraw}
                    step={0.000001}
                    max={vesting_shares - delegated_vesting_shares}
                    format={formatSp}
                    onChange={sliderChange}
                />
                <div className="row">
                    <div className="column small-2" style={{paddingTop: 6}}>{tt('g.amount')}</div>
                    <div className="column small-10">
                        <div className="input-group" style={{marginBottom: "0.25rem"}}>
                            <input type="text"
                                value={manual_entry ? manual_entry : formatSp(new_withdraw)}
                                onChange={inputChange}
                                autoCorrect={false}
                            />
                            <span className="input-group-label uppercase">{LIQUID_TICKER}</span>
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="column small-10">
                        <ul className="powerdown-notes" style={{marginLeft: 0, marginTop: 2}}>{notes}</ul>
                        <button
                            type="submit"
                            className="button"
                            onClick={powerDown}
                            disabled={broadcasting}
                        >
                            {tt('powerdown_jsx.power_down')}
                        </button>
                    </div>
            </div>
         </div>
        );
    }
}

export default connect(
    (state, ownProps) => {
        const values = state.user.get('powerdown_defaults');
        const account = values.get('account');
        const to_withdraw = parseFloat(values.get('to_withdraw')) / 1e6;
        const withdrawn = parseFloat(values.get('withdrawn')) / 1e6;
        const vesting_shares = assetFloat(
            values.get('vesting_shares'),
            VEST_TICKER
        );
        const delegated_vesting_shares = assetFloat(
            values.get('delegated_vesting_shares'),
            VEST_TICKER
        );
        const available_shares =
            vesting_shares - to_withdraw - withdrawn - delegated_vesting_shares;

        return {
            ...ownProps,
            account,
            available_shares,
            delegated_vesting_shares,
            state,
            to_withdraw,
            vesting_shares,
            withdrawn,
            gprops: state.global.get('props').toJS()
        };
    },

    dispatch => ({
        successCallback: () => {
            dispatch(user.actions.hidePowerdown());
        },
        powerDown: e => {
            e.preventDefault();
            const name = 'powerDown';
            dispatch(g.actions.showDialog({ name }));
        },
        withdrawVesting: ({
            account,
            vesting_shares,
            errorCallback,
            successCallback,
        }) => {
            const successCallbackWrapper = (...args) => {
                dispatch(
                    { type: 'FETCH_STATE', payload: { pathname: `@${account}/transfers` } }
                );
                return successCallback(...args);
            };
            dispatch(
                transaction.actions.broadcastOperation({
                    type: 'withdraw_vesting',
                    operation: { account, vesting_shares },
                    errorCallback,
                    successCallback: successCallbackWrapper,
                })
            );
        },
    })
)(Powerdown);
