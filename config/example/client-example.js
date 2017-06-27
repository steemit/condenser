// sometimes it's impossible to use html tags to style coin name, hence usage of _UPPERCASE modifier
export const APP_NAME   = 'Голос'
// sometimes APP_NAME is written in non-latin characters, but they are needed for technical purposes
// ie. "Голос" > "Golos"
export const APP_NAME_LATIN         = 'Golos'
export const APP_NAME_UPPERCASE     = 'Golos'
export const APP_ICON               = 'golos'
export const APP_URL                = 'golos.io'

export const LIQUID_TOKEN               = 'Голос'
export const LIQUID_TOKEN_UPPERCASE     = 'ГОЛОС'


export const VESTING_TOKEN              = 'Сила Голоса'
export const VESTING_TOKEN_UPPERCASE    = 'СИЛА ГОЛОСА'
export const VESTING_TOKEN_SHORT        = 'СГ'

export const VESTING_TOKEN1             = 'Сил Голоса'
export const VESTING_TOKEN2             = 'Силу Голоса'
export const VESTING_TOKEN3             = 'Силах Голоса'
export const VESTING_TOKENS             = 'Силы Голоса'


export const DEBT_TOKEN                 = 'Золотой'

// export const DEBT_TOKEN_UPPERCASE = 'Golos Backed Gold'
export const CURRENCY_SIGN = '₽≈' // '$'
export const WIKI_URL = 'https://wiki.golos.io/'
//export const WELCOME_PAGE_URL       = 'https://golos.io/welcome'

export const LANDING_PAGE_URL       = 'https://golos.io/about'
export const TERMS_OF_SERVICE_URL   = 'https://golos.io/legal/terms_of_service.pdf'
export const PRIVACY_POLICY_URL     = 'https://golos.io/ru--konfidenczialxnostx/@golos/politika-konfidencialnosti'
export const WHITEPAPER_URL         = 'https://golos.io/ru--golos/@golos/golos-russkoyazychnaya-socialno-mediinaya-blokchein-platforma'


// these are dealing with asset types, not displaying to client, rather sending data over websocket
export const LIQUID_TICKER = 'GOLOS'
export const VEST_TICKER = 'GESTS'
export const DEBT_TICKER = 'GBG'
export const DEBT_TOKEN_SHORT = 'GBG'

// application settings
export const DEFAULT_LANGUAGE = 'ru' // 'en' // used on application internationalization bootstrap
export const DEFAULT_CURRENCY = 'RUB'
export const ALLOWED_CURRENCIES = ['RUB', 'UAH', 'BYN', 'USD', 'EUR', 'CNY', 'GEL', 'KZT']
export const FRACTION_DIGITS = 2 // default amount of decimal digits
export const FRACTION_DIGITS_MARKET = 3 // accurate amount of deciaml digits (example: used in market)

// meta info
export const TWITTER_HANDLE = '@example'
export const SHARE_IMAGE = 'https://golos.io/images/golos-share.png'
export const TWITTER_SHARE_IMAGE = 'https://golos.io/images/golos-twshare.png'
export const SITE_DESCRIPTION = 'Голос - социальная сеть, построенная на публичном блокчейне. Вознаграждение пользователей осуществляется за счет дополнительной эмиссии токенов. При этом распределением токенов управляют текущие пользователи сети через голосование за лучший контент.'

// various
export const SUPPORT_EMAIL = 'support@yourdomain.name'
export const SEGMENT_ANALYTICS_KEY = 'SEGMENT_ANALYTICS_KEY'
export const FIRST_DATE = new Date(Date.UTC(2016, 7, 1)); //1 september
export const SCRAP_EMBED_SINCE = new Date(Date.UTC(2017, 4, 5));

// ignore special tags, dev-tags, partners tags
export const IGNORE_TAGS = ['test', 'bm-open', 'bm-ceh23', 'bm-tasks', 'bm-taskceh1']
export const SELECT_TAGS_KEY = 'golos:select.categories'
export const PUBLIC_API = {
  trending:     ['get_discussions_by_trending',   'trending'],
  trending30:   ['get_discussions_by_trending30', 'trending30'],
  responses:    ['get_discussions_by_children',   'responses'],
  hot:          ['get_discussions_by_hot',        'hot'],
  promoted:     ['get_discussions_by_promoted',   'promoted'],
  votes:        ['get_discussions_by_votes',      'votes'],
  cashout:      ['get_discussions_by_cashout',    'cashout'],
  active:       ['get_discussions_by_active',     'active'],
  created:      ['get_discussions_by_created',    'created'],
  recent:       ['get_discussions_by_created',    'created'],
  witnesses:    ['get_witnesses_by_vote',         'witnesses'],
  tags:         ['get_trending_tags',             'tags'],
  tagsbyauthor: ['get_tags_used_by_author',       'tagsbyauthor']
}
export const SEO_TITLE = 'GOLOS.io Блоги'
