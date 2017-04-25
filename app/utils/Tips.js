import tt from 'counterpart';
import { APP_NAME, LIQUID_TOKEN, VESTING_TOKEN } from 'app/client_config';

export const transferTips = {
    'Transfer to Account': tt('transfer_jsx.move_funds_to_another_account', {APP_NAME}),
    'Transfer to Savings': tt('transfer_jsx.protect_funds_by_requiring_a_3_day_withdraw_waiting_period'),
    'Savings Withdraw': tt('transfer_jsx.withdraw_funds_after_the_required_3_day_waiting_period'),
}

// THIS TIPS DO NOT WORK PROPERLY TO DUE BAD RENDERING
// this constants are defined once, but for proper translation strings to work they must be statefull

export const powerTip2 = tt('tips_js.VESTING_TOKEN_is_non_transferrable_and_requires_convert_back_to_LIQUID_TOKEN', {LIQUID_TOKEN, VESTING_TOKEN})
export const powerTip3 = tt('tips_js.converted_VESTING_TOKEN_can_be_sent_to_yourself_but_can_not_transfer_again', {VESTING_TOKEN})
