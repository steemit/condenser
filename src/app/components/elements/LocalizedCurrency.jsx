import { FRACTION_DIGITS, DEFAULT_CURRENCY } from 'app/client_config';

const localCurrencySymbol = DEFAULT_CURRENCY;
const localizedCurrency = value => value;

export { localizedCurrency, localCurrencySymbol }
