// sometimes it's impossible to use html tags to style coin name, hence usage of _UPPERCASE modifier
export const APP_NAME = 'Голос'
// sometimes APP_NAME is written in non-latin characters, but they are needed for technical purposes
// ie. "Голос" > "Golos"
export const APP_NAME_LATIN = 'Golos'
export const APP_NAME_UPPERCASE = 'GOLOS'
export const APP_ICON = 'golos'
// FIXME figure out best way to do this on both client and server from env
// vars. client should read $STM_Config, server should read config package.
export const APP_DOMAIN = 'golos.io';
export const LIQUID_TOKEN = 'Голос'
// sometimes it's impossible to use html tags to style coin name, hence usage of _UPPERCASE modifier
export const LIQUID_TOKEN_UPPERCASE = 'ГОЛОС'
export const VESTING_TOKEN = 'Сила Голоса'
export const VESTING_TOKEN_UPPERCASE = 'СИЛА ГОЛОСА'
export const VESTING_TOKEN_SHORT = 'СГ'

export const VESTING_TOKEN1 = 'Сил Голоса'
export const VESTING_TOKEN2 = 'Силу Голоса'
export const VESTING_TOKEN3 = 'Силах Голоса'
export const VESTING_TOKENS = 'Силы Голоса'

export const DEBT_TOKEN = 'Золотой'
export const DEBT_TOKENS = 'Золотые'
export const CURRENCY_SIGN = '₽≈'
export const TOKEN_WORTH = '~1 мг золота'
export const WIKI_URL = 'https://wiki.' + APP_DOMAIN + '/'
export const LANDING_PAGE_URL = 'https://' + APP_DOMAIN + '/about'
export const TERMS_OF_SERVICE_URL = 'https://' + APP_DOMAIN + '/legal/terms_of_service.pdf'
export const PRIVACY_POLICY_URL = 'https://' + APP_DOMAIN + '/ru--konfidenczialxnostx/@golos/politika-konfidencialnosti'
export const WHITEPAPER_URL = 'https://' + APP_DOMAIN + '/ru--golos/@golos/golos-russkoyazychnaya-socialno-mediinaya-blokchein-platforma'


// these are dealing with asset types, not displaying to client, rather sending data over websocket
export const LIQUID_TICKER = 'GOLOS'
export const VEST_TICKER = 'GESTS'
export const DEBT_TICKER = 'GBG'
export const DEBT_TOKEN_SHORT = 'GBG'

// application settings
export const DEFAULT_LANGUAGE = 'ru' // used on application internationalization bootstrap
export const LOCALE_COOKIE_KEY = 'gls.locale'
export const LANGUAGES = {
  ru: 'Русский',
  en: 'English',
  /* in react-intl they use 'uk' instead of 'ua' */
  uk: 'Українська',
  sr: 'Srpski',
  ro: 'Română',
}
// First element always is USD, it needs to be correct fetch yahoo exchange rates from server side
export const CURRENCIES = ['USD', 'RUB', 'UAH', 'BYN', 'EUR', 'CNY', 'GEL', 'KZT']
export const DEFAULT_CURRENCY = CURRENCIES[0]
export const CURRENCY_COOKIE_KEY = 'gls.currency'
export const FRACTION_DIGITS = 2 // default amount of decimal digits
export const FRACTION_DIGITS_MARKET = 3 // accurate amount of deciaml digits (example: used in market)

// meta info
export const TWITTER_HANDLE = '@goloschain'
export const SHARE_IMAGE = 'https://' + APP_DOMAIN + '/images/golos-share.png'
export const TWITTER_SHARE_IMAGE = 'https://' + APP_DOMAIN + '/images/golos-twshare.png'
export const SITE_DESCRIPTION = 'Голос - социальная сеть, построенная на публичном блокчейне. Вознаграждение пользователей осуществляется за счет дополнительной эмиссии токенов. При этом распределением токенов управляют текущие пользователи сети через голосование за лучший контент.'

// various
export const SUPPORT_EMAIL = 'support@' + APP_DOMAIN
export const FIRST_DATE = new Date(Date.UTC(2016, 7, 1)); //1 september
// ignore special tags, dev-tags, partners tags
export const IGNORE_TAGS = ['test', 'bm-open', 'bm-ceh23', 'bm-tasks', 'bm-taskceh1']
export const SELECT_TAGS_KEY = 'gls.select.tags'
export const PUBLIC_API = {
  trending:        ['getDiscussionsByTrendingAsync',      'trending'],
  trending30:      ['getDiscussionsByTrending30Async',    'trending30'],
  responses:       ['getDiscussionsByChildrenAsync',      'responses'],
  hot:             ['getDiscussionsByHotAsync',           'hot'],
  promoted:        ['getDiscussionsByPromotedAsync',      'promoted'],
  votes:           ['getDiscussionsByVotesAsync',         'votes'],
  cashout:         ['getDiscussionsByCashoutAsync',       'cashout'],
  payout:          ['getPostDiscussionsByPayoutAsync',    'payout'],
  payout_comments: ['getCommentDiscussionsByPayoutAsync', 'payout_comments'],
  active:          ['getDiscussionsByActiveAsync',        'active'],
  created:         ['getDiscussionsByCreatedAsync',       'created'],
  recent:          ['getDiscussionsByCreatedAsync',       'created'],
  witnesses:       ['getWitnessesByVoteAsync',            'witnesses'],
  tags:            ['getTrendingTagsAsync',               'tags'],
  tagsbyauthor:    ['getTagsUsedByAuthorAsync',           'tagsbyauthor']
}
export const SEO_TITLE = 'GOLOS.io Блоги'
export const DEFAULT_DOMESTIC = 'all'
export const DOMESTIC = {
  all: 'All langs',
  ru:  'Русский',
  ua:  'Український',
  us:  'English',
  by:  'Белору́сский',
  rs:  'Srpski',
  ro:  'Română',
  am:  'գրաբար',
  kz:  'Қазақ тілі',
  tj:  'Забо́ни тоҷикӣ',
  md:  'Limba moldovenească',
  ar:  'العربية',
  cn:  '漢',
  es:  'Español',
  in:  'हिन्दी',
  pt:  'Portuguesa',
  fr:  'Français'
}
export const SEGMENT_ANALYTICS_KEY = 'F7tldQJxt491gXYqDGi5TkTT4wFpSPps'
// ui themes
export const THEMES = ['Default', 'Green', 'Red']
export const DEFAULT_THEME = THEMES[0]
