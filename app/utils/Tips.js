import tt from 'counterpart';
import { APP_NAME, LIQUID_TOKEN, VESTING_TOKEN } from 'app/client_config';

export const savingsTip = tt('transfer_jsx.balance_subject_to_3_day_withdraw_waiting_period');
export const transferTips = {
    'Transfer to Account': tt('transfer_jsx.move_funds_to_another_account', {APP_NAME}),
    'Transfer to Savings': tt('transfer_jsx.protect_funds_by_requiring_a_3_day_withdraw_waiting_period'),
    'Savings Withdraw':    tt('transfer_jsx.withdraw_funds_after_the_required_3_day_waiting_period'),
}

// THIS TIPS DO NOT WORK PROPERLY TO DUE BAD RENDERING
// this constants are defined once, but for proper translation strings to work they must be statefull

export const steemTip = tt('tips_js.tradeable_tokens_that_may_be_transferred_anywhere_at_anytime') + ' ' + tt('tips_js.LIQUID_TOKEN_can_be_converted_to_VESTING_TOKEN_in_a_process_called_powering_up', {LIQUID_TOKEN, VESTING_TOKEN})
export const powerTip = tt('tips_js.influence_tokens_which_give_you_more_control_over')
//export const powerTip = tt('tips_js.influence_tokens_which_earn_more_power_by_holding_long_term') + ' ' + tt('tips_js.the_more_you_hold_the_more_you_influence_post_rewards') //TODO: this text is outdated
export const valueTip = tt('tips_js.the_estimated_value_is_based_on_an_average_value_of_steem_in_US_dollars')
export const powerTip2 = tt('tips_js.VESTING_TOKEN_is_non_transferrable_and_requires_convert_back_to_LIQUID_TOKEN', {LIQUID_TOKEN, VESTING_TOKEN})
export const powerTip3 = tt('tips_js.converted_VESTING_TOKEN_can_be_sent_to_yourself_but_can_not_transfer_again', {VESTING_TOKEN})
