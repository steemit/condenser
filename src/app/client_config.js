// sometimes it's impossible to use html tags to style coin name, hence usage of _UPPERCASE modifier
export const APP_NAME = 'vit.tube';
// sometimes APP_NAME is written in non-latin characters, but they are needed for technical purposes
// ie. "Голос" > "Golos"
export const APP_NAME_LATIN = 'vit.tube';
export const APP_NAME_UPPERCASE = 'VIT.TUBE';
export const APP_ICON = 'steem'; // don't change this value, the icon has been changed
// FIXME figure out best way to do this on both client and server from env
// vars. client should read $STM_Config, server should read config package.
export const APP_URL = 'https://touchit.social';
export const APP_DOMAIN = 'touchit.social';
export const LIQUID_TOKEN = 'VIT';
// sometimes it's impossible to use html tags to style coin name, hence usage of _UPPERCASE modifier
export const LIQUID_TOKEN_UPPERCASE = 'VIT';
export const VESTING_TOKEN = 'VIT POWER';
export const INVEST_TOKEN_UPPERCASE = 'VIT POWER';
export const INVEST_TOKEN_SHORT = 'SP';
export const DEBT_TOKEN = 'VIT DOLLAR';
export const DEBT_TOKENS = 'VIT DOLLARS';
export const CURRENCY_SIGN = '$';
export const WIKI_URL = ''; // https://wiki.golos.io/
export const LANDING_PAGE_URL = 'https://steem.io/';
export const TERMS_OF_SERVICE_URL = 'https://' + APP_DOMAIN + '/tos.html';
export const PRIVACY_POLICY_URL = 'https://' + APP_DOMAIN + '/privacy.html';
export const WHITEPAPER_URL =
    'https://vicetoken.com/static/Vice_Industry_Token_Whitepaper.pdf';

// default avatar and sizes
export const DEFAULT_AVATAR = 'https://proto.touchit.social/images/user.png';
export const AVATAR_SIZE_SMALL = 64;
export const AVATAR_SIZE_MEDIUM = 128;
export const AVATAR_SIZE_LARGE = 512;

// these are dealing with asset types, not displaying to client, rather sending data over websocket
export const LIQUID_TICKER = 'VIT';
export const VEST_TICKER = 'VESTS';
export const DEBT_TICKER = 'SBD';
export const DEBT_TOKEN_SHORT = 'SBD';

// application settings
export const DEFAULT_LANGUAGE = 'en'; // used on application internationalization bootstrap
export const DEFAULT_CURRENCY = 'USD';
export const ALLOWED_CURRENCIES = ['USD'];
export const FRACTION_DIGITS = 2; // default amount of decimal digits
export const FRACTION_DIGITS_MARKET = 3; // accurate amount of deciaml digits (example: used in market)

// meta info
export const TWITTER_HANDLE = '@steemit';
export const SHARE_IMAGE =
    'https://' + APP_DOMAIN + '/images/steemit-share.png';
export const TWITTER_SHARE_IMAGE =
    'https://' + APP_DOMAIN + '/images/steemit-twshare.png';
export const SITE_DESCRIPTION =
    'vit.tube is a social media platform where everyone gets paid for ' +
    'creating and curating content. It leverages a robust digital points system, called VIT, that ' +
    'supports real value for digital rewards through market price discovery and liquidity';

// various
export const SUPPORT_EMAIL = 'support@' + APP_DOMAIN;
