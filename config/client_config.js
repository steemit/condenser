// sometimes it's impossible to use html tags to style coin name, hence usage of _UPPERCASE modifier
export const APP_NAME = 'Голос' // 'Steemit'
export const APP_NAME_UPPERCASE = 'Golos' // 'STEEMIT'
export const APP_ICON = 'golos' // 'steem'
export const APP_URL = 'golos.io' // 'steemit.com'
export const OWNERSHIP_TOKEN = 'Голос' // 'Steem'
// sometimes it's impossible to use html tags to style coin name, hence usage of _UPPERCASE modifier
export const OWNERSHIP_TOKEN_UPPERCASE = 'ГОЛОС' // 'STEEM'
export const INVEST_TOKEN = 'Сила Голоса' // 'Steem Power'
export const INVEST_TOKEN_UPPERCASE = 'СИЛА ГОЛОСА' // 'STEEM POWER'
export const INVEST_TOKEN_SHORT = 'СГ' // 'SP'
export const DEBT_TOKEN = 'Золотой' // 'STEEM DOLLAR'
// export const DEBT_TOKEN_UPPERCASE = 'Golos Backed Gold' // 'STEEM DOLLAR'
// export const DEBT_TOKEN_SHORT = 'GBG' // 'SD'
export const CURRENCY_SIGN = '₽≈' // '$'
export const LANDING_PAGE_URL = 'http://golos.io'
export const WHITEPAPER_URL = 'https://github.com/GolosChain/wiki'
export const SEGMENT_ANALYTICS_KEY = 'F7tldQJxt491gXYqDGi5TkTT4wFpSPps'
// used on application internationalization bootstrap
export const DEFAULT_LANGUAGE = 'ru' // 'en'

// these are dealing with asset types, not displaying to client, rather sending data over websocket

export const OWNERSHIP_TICKER = 'GOLOS'
export const INVEST_TICKER = 'GP'
export const VEST_TICKER = 'GESTS'
export const DEBT_TICKER = 'GBG'
export const DEBT_TOKEN_SHORT = 'GBG' // 'SD'

export const DEFAULT_CURRENCY = 'RUB'
export const ALLOWED_CURRENCIES = ['RUB', 'UAH', 'BYN', 'USD', 'EUR', 'CNY', 'GEL', 'KZT']
export const FRACTION_DIGITS = 2 // default amount of decimal digits
export const FRACTION_DIGITS_MARKET = 3 // accurate amount of deciaml digits (example: used in market)

// Рубли, гривны, белорусские рубли
// + Тенге, EUR, USD, CNY
// Грузинские тугрики (латы)

export const SITE_DESCRIPTION = 'Голос - социальная сеть, построенная на публичном блокчейне. Вознаграждение пользователей осуществляется за счет дополнительной эмиссии токенов. При этом распределением токенов управляют текущие пользователи сети через голосование за лучший контент.'

// export const LANDING_PAGE_URL =
// export const WHITEPAPER_URL =
export const FIRST_DATE = new Date(Date.UTC(2016, 7, 1)); //1 september
