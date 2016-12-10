import { translate } from 'app/Translator';

export const savingsTip = translate('balance_subject_to_3_day_withdraw_waiting_period')
export const transferTips = {
    'Transfer to Account': 'Move funds to another Steemit account.',
    'Transfer to Savings': 'Protect funds by requiring a 3 day withdraw waiting period.',
    'Savings Withdraw': 'Withdraw funds after the required 3 day waiting period.',
}

export const steemTip = translate('tradeable_tokens_that_may_be_transferred_anywhere_at_anytime') + ' ' + translate('LIQUID_TOKEN_can_be_converted_to_VESTING_TOKEN_in_a_process_called_powering_up')
export const powerTip = translate('influence_tokens_which_give_you_more_control_over_post_payouts_and_allow_you_to_earn_on_curation_rewards')
//export const powerTip = translate('influence_tokens_which_earn_more_power_by_holding_long_term') + ' ' + translate('the_more_you_hold_the_more_you_influence_post_rewards') //TODO: this text is outdated
export const valueTip = translate('the_estimated_value_is_based_on_a_7_day_average_value_of_LIQUID_TOKEN_in_currency')
export const powerTip2 = translate('VESTING_TOKEN_is_non_transferrable_and_requires_convert_back_to_LIQUID_TOKEN')
export const powerTip3 = translate('converted_VESTING_TOKEN_can_be_sent_to_yourself_but_can_not_transfer_again')
