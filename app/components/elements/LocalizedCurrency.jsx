import { FRACTION_DIGITS, DEFAULT_CURRENCY } from 'config/client_config';

let localCurrencySymbol = DEFAULT_CURRENCY;
let localizedCurrency = (value) => value;

export { localizedCurrency, localCurrencySymbol }
