import tt from 'counterpart';
import { APP_NAME, LIQUID_TOKEN, VESTING_TOKEN } from 'app/client_config';

// THIS TIPS DO NOT WORK PROPERLY TO DUE BAD RENDERING
// this constants are defined once, but for proper translation strings to work they must be statefull

export const steemTip = tt('tips_js.tradeable_tokens_that_may_be_transferred_anywhere_at_anytime') + ' ' + tt('tips_js.LIQUID_TOKEN_can_be_converted_to_VESTING_TOKEN_in_a_process_called_powering_up', {LIQUID_TOKEN, VESTING_TOKEN})
//export const powerTip = tt('tips_js.influence_tokens_which_earn_more_power_by_holding_long_term') + ' ' + tt('tips_js.the_more_you_hold_the_more_you_influence_post_rewards') //TODO: this text is outdated
export const valueTip = tt('tips_js.the_estimated_value_is_based_on_an_average_value_of_steem_in_US_dollars', {LIQUID_TOKEN})
