import { APP_NAME, OWNERSHIP_TOKEN, OWNERSHIP_TOKEN_UPPERCASE, DEBT_TOKEN, DEBT_TOKEN_SHORT, CURRENCY_SIGN, INVEST_TOKEN } from 'config/client_config';

// TODO add comments and explanations
// TODO change name to formatCoinTypes?
export function formatCoins(string) {
	// return null or undefined if string is not provided
	if(!string) return string
	// TODO use .to:owerCase() ? for string normalisation
	string = string.replace('SBD', DEBT_TOKEN_SHORT ).replace('SD', DEBT_TOKEN_SHORT)
		  		   .replace('Steem Power', INVEST_TOKEN).replace('STEEM POWER', INVEST_TOKEN)
		    	   .replace('Steem', OWNERSHIP_TOKEN).replace('STEEM', OWNERSHIP_TOKEN_UPPERCASE)
				   .replace('$', CURRENCY_SIGN)
	return string
}
