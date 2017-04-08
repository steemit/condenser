import { FRACTION_DIGITS, DEFAULT_CURRENCY } from 'app/client_config';

let localCurrencySymbol = DEFAULT_CURRENCY;
let localizedCurrency = (value) => value;

export { localizedCurrency, localCurrencySymbol }
