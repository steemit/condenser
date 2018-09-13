import {
    APP_NAME,
    LIQUID_TOKEN,
    LIQUID_TOKEN_UPPERCASE,
    CURRENCY_SIGN,
    VESTING_TOKEN,
} from 'app/client_config';

// TODO add comments and explanations
// TODO change name to formatCoinTypes?
// TODO make use of DEBT_TICKER etc defined in config/clietn_config
export function formatCoins(string) {
    // return null or undefined if string is not provided
    if (!string) return string;
    // TODO use .to:owerCase() ? for string normalisation
    string = string
        .replace('Vit Power', VESTING_TOKEN)
        .replace('VIT POWER', VESTING_TOKEN)
        .replace('Vit', LIQUID_TOKEN)
        .replace('VIT', LIQUID_TOKEN_UPPERCASE)
        .replace('$', CURRENCY_SIGN);
    return string;
}
