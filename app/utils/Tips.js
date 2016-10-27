<<<<<<< HEAD
import { translate } from 'app/Translator';


// THIS TIPS DO NOT WORK PROPERLY TO DUE BAD RENDERING
// this constants are defined once, but for proper translation strings to work they must be statefull

export const steemTip = translate('tradeable_tokens_that_may_be_transferred_anywhere_at_anytime') + ' ' + translate('OWNERSHIP_TOKEN_can_be_converted_to_INVEST_TOKEN_in_a_process_called_powering_up')
export const dollarTip = translate('tokens_worth_about_AMOUNT_of_OWNERSHIP_TOKEN')
//export const powerTip = 'Influence tokens which give you more control over post payouts and allow you to earn on curation rewards.'
export const powerTip = translate('influence_tokens_which_earn_more_power_by_holding_long_term') + ' ' + translate('the_more_you_hold_the_more_you_influence_post_rewards')
export const valueTip = translate('the_estimated_value_is_based_on_a_7_day_average_value_of_OWNERSHIP_TOKEN_in_currency')
export const powerTip2 = translate('INVEST_TOKEN_is_non_transferrable_and_will_require_2_years_and_104_payments_to_convert_back_to_OWNERSHIP_TOKEN')
export const powerTip3 = translate('converted_INVEST_TOKEN_can_be_sent_to_yourself_but_can_not_transfer_again')
=======
export const steemTip = 'Tradeable tokens that may be transferred anywhere at anytime. Steem can be converted to Steem Power in a process called powering up.'
export const dollarTip = 'Tokens worth about $1.00 of STEEM, currently collecting 10% APR.'
export const powerTip = 'Influence tokens which give you more control over post payouts and allow you to earn on curation rewards.'
export const valueTip = 'The estimated value is based on a 7 day average value of Steem in US Dollars.'
export const powerTip2 = 'Steem Power is non-transferrable and will require 2 years and 104 payments to convert back to Steem.'
export const powerTip3 = 'Converted Steem Power can be sent to yourself or someone else but can not transfer again without converting back to Steem.'

export const savingsTip = 'Balance subject to 3 day withdraw waiting period.'
export const transferTips = {
    'Transfer to Account': 'Move funds to another Steemit account.',
    'Transfer to Savings': 'Protect funds by requiring a 3 day withdraw waiting period.',
    'Savings Withdraw': 'Withdraw funds after the required 3 day waiting period.',
}
>>>>>>> steemit/develop
