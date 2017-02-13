// sometimes it's impossible to use html tags to style coin name, hence usage of _UPPERCASE modifier
export const APP_NAME   = 'Голос' // 'Steemit'
// sometimes APP_NAME is written in non-latin characters, but they are needed for technical purposes
// ie. "Голос" > "Golos"
export const APP_NAME_LATIN         = 'Golos' // 'Steemit'
export const APP_NAME_UPPERCASE     = 'Golos' // 'STEEMIT'
export const APP_ICON               = 'golos' // 'steem'
export const APP_URL                = 'golos.io' // 'steemit.com'

export const LIQUID_TOKEN               = 'Голос' // 'Steem'
export const LIQUID_TOKEN_UPPERCASE     = 'ГОЛОС' // sometimes it's impossible to use html tags to style coin name, hence usage of _UPPERCASE modifier


export const VESTING_TOKEN              = 'Сила Голоса' // 'Steem Power'
export const VESTING_TOKEN_UPPERCASE    = 'СИЛА ГОЛОСА' // 'STEEM POWER'
export const VESTING_TOKEN_SHORT        = 'СГ' // 'SP'

export const VESTING_TOKEN1             = 'Сил Голоса'
export const VESTING_TOKEN2             = 'Силу Голоса'
export const VESTING_TOKEN3             = 'Силах Голоса'
export const VESTING_TOKENS             = 'Силы Голоса'


export const DEBT_TOKEN                 = 'Золотой'

// export const DEBT_TOKEN_UPPERCASE = 'Golos Backed Gold' // 'STEEM DOLLAR'
export const CURRENCY_SIGN = '₽≈' // '$'
export const WIKI_URL = 'https://wiki.golos.io/'
//export const WELCOME_PAGE_URL       = 'https://golos.io/welcome'

export const LANDING_PAGE_URL       = 'https://golos.io/ico'
export const TERMS_OF_SERVICE_URL   = 'https://golos.io/legal/terms_of_service.pdf'
export const PRIVACY_POLICY_URL     = 'https://golos.io/ru--konfidenczialxnostx/@golos/politika-konfidencialnosti'
export const WHITEPAPER_URL         = 'https://golos.io/ru--golos/@golos/golos-russkoyazychnaya-socialno-mediinaya-blokchein-platforma'


// these are dealing with asset types, not displaying to client, rather sending data over websocket
export const LIQUID_TICKER = 'GOLOS'
export const VEST_TICKER = 'GESTS'
export const DEBT_TICKER = 'GBG'
export const DEBT_TOKEN_SHORT = 'GBG' // 'SD'

// application settings
export const DEFAULT_LANGUAGE = 'ru' // 'en' // used on application internationalization bootstrap
export const DEFAULT_CURRENCY = 'RUB'
export const ALLOWED_CURRENCIES = ['RUB', 'UAH', 'BYN', 'USD', 'EUR', 'CNY', 'GEL', 'KZT']
export const FRACTION_DIGITS = 2 // default amount of decimal digits
export const FRACTION_DIGITS_MARKET = 3 // accurate amount of deciaml digits (example: used in market)

// meta info
export const TWITTER_HANDLE = '@goloschain'
export const SHARE_IMAGE = 'https://golos.io/images/golos-share.png'
export const TWITTER_SHARE_IMAGE = 'https://golos.io/images/golos-twshare.png'
export const SITE_DESCRIPTION = 'Голос - социальная сеть, построенная на публичном блокчейне. Вознаграждение пользователей осуществляется за счет дополнительной эмиссии токенов. При этом распределением токенов управляют текущие пользователи сети через голосование за лучший контент.'

// various
export const SUPPORT_EMAIL = 't@cyber.fund'
export const SEGMENT_ANALYTICS_KEY = 'F7tldQJxt491gXYqDGi5TkTT4wFpSPps'
export const FIRST_DATE = new Date(Date.UTC(2016, 7, 1)); //1 september
