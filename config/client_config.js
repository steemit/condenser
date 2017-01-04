// sometimes it's impossible to use html tags to style coin name, hence usage of _UPPERCASE modifier
export const APP_NAME = 'Steemit'
// sometimes APP_NAME is written in non-latin characters, but they are needed for technical purposes
// ie. "Голос" > "Golos"
export const APP_NAME_LATIN = 'Steemit'
export const APP_NAME_UPPERCASE = 'STEEMIT'
export const APP_ICON = 'steem'
export const APP_URL = 'steemit.com'
export const LIQUID_TOKEN = 'Steem'
// sometimes it's impossible to use html tags to style coin name, hence usage of _UPPERCASE modifier
export const LIQUID_TOKEN_UPPERCASE = 'STEEM'
export const VESTING_TOKEN = 'Steem Power'
export const INVEST_TOKEN_UPPERCASE = 'STEEM POWER'
export const INVEST_TOKEN_SHORT = 'SP'
export const DEBT_TOKEN = 'STEEM DOLLAR'
export const CURRENCY_SIGN = '$'
export const WIKI_URL = '' // https://wiki.golos.io/
export const LANDING_PAGE_URL = 'https://steem.io/'
export const TERMS_OF_SERVICE_URL = 'https://steemit.com/tos.html'
export const PRIVACY_POLICY_URL = 'https://steemit.com/privacy.html'
export const WHITEPAPER_URL = 'https://steem.io/SteemWhitePaper.pdf'

// these are dealing with asset types, not displaying to client, rather sending data over websocket
export const LIQUID_TICKER = 'STEEM'
export const DEBT_TICKER = 'SBD'
export const DEBT_TOKEN_SHORT = 'SD'

// application settings
export const DEFAULT_LANGUAGE = 'en' // used on application internationalization bootstrap
export const DEFAULT_CURRENCY = 'USD'
export const ALLOWED_CURRENCIES = ['USD']
export const FRACTION_DIGITS = 2 // default amount of decimal digits
export const FRACTION_DIGITS_MARKET = 3 // accurate amount of deciaml digits (example: used in market)

// meta info
export const TWITTER_HANDLE = '@steemit'
export const SHARE_IMAGE = 'https://steemit.com/images/steemit-share.png'
export const TWITTER_SHARE_IMAGE = 'https://steemit.com/images/steemit-twshare.png'
export const SITE_DESCRIPTION = 'Steemit is a social media platform where everyone gets paid for creating and curating content. It leverages a robust digital points system, called Steem, that supports real value for digital rewards through market price discovery and liquidity'

// various
export const SUPPORT_EMAIL = 'support@steemit.com'
