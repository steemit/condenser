import { translate } from 'app/Translator';


// THIS TIPS DO NOT WORK PROPERLY DUE BAD RENDERING
// this constants are defined once, but for proper translation strings to work they must be statefull

export const steemTip = translate('tradeable_tokens_that_may_be_transferred_anywhere_at_anytime') + ' ' + translate('OWNERSHIP_TOKEN_can_be_converted_to_INVEST_TOKEN_in_a_process_called_powering_up')
export const dollarTip = translate('tokens_worth_about_CURRENCY_SIGN_of_OWNERSHIP_TOKEN')
//export const powerTip = 'Influence tokens which give you more control over post payouts and allow you to earn on curation rewards.'
export const powerTip = translate('influence_tokens_which_earn_more_power_by_holding_long_term') + ' ' + translate('the_more_you_hold_the_more_you_influence_post_rewards')
export const valueTip = translate('the_estimated_value_is_based_on_a_7_day_average_value_of_steem_in_currency')
export const powerTip2 = translate('steem_power_is_non_transferrable_and_will_require_2_years_and_104_payments_to_convert_back_to_steem')
export const powerTip3 = translate('converted_steem_power_can_be_sent_to_yourself_but_can_not_transfer_again')
