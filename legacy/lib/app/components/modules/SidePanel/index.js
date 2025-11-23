'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactRedux = require('react-redux');

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _counterpart = require('counterpart');

var _counterpart2 = _interopRequireDefault(_counterpart);

var _AppReducer = require('app/redux/AppReducer');

var appActions = _interopRequireWildcard(_AppReducer);

var _CloseButton = require('app/components/elements/CloseButton');

var _CloseButton2 = _interopRequireDefault(_CloseButton);

var _Icon = require('app/components/elements/Icon');

var _Icon2 = _interopRequireDefault(_Icon);

var _reactRouter = require('react-router');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SidePanel = function SidePanel(_ref) {
    var alignment = _ref.alignment,
        visible = _ref.visible,
        hideSidePanel = _ref.hideSidePanel,
        showSidePanel = _ref.showSidePanel,
        username = _ref.username,
        walletUrl = _ref.walletUrl,
        nightmode = _ref.nightmode,
        toggleNightmode = _ref.toggleNightmode,
        user_preferences = _ref.user_preferences,
        setUserPreferences = _ref.setUserPreferences;

    var documentClick = function documentClick(e) {
        console.log(e.target.nodeName);
        console.log(visible);
        hideSidePanel();
    };
    if (process.env.BROWSER) {
        visible && document.addEventListener('click', hideSidePanel);
        !visible && document.removeEventListener('click', hideSidePanel);
    }

    var loggedIn = username === undefined ? 'show-for-small-only' : 'SidePanel__hide-signup';
    var refCb = function refCb(dom) {
        dom && dom.addEventListener('click', function (e) {
            e.stopPropagation();
        });
    };
    var handleLanguageChange = function handleLanguageChange(event) {
        var locale = event.target.value;
        var userPreferences = (0, _extends3.default)({}, user_preferences, { locale: locale });
        // console.log(locale);
        setUserPreferences(userPreferences);
        hideSidePanel();
    };
    var makeLink = function makeLink(i, ix, arr) {
        // A link is internal if it begins with a slash
        var isExternal = !i.link.match(/^\//) || i.isExternal;
        var cn = ix === arr.length - 1 ? 'last' : null;
        if (i.key === 'switchLanguage') {
            return _react2.default.createElement(
                'li',
                { key: ix, className: cn },
                _react2.default.createElement(
                    'select',
                    {
                        defaultValue: user_preferences.locale,
                        onChange: function onChange(e) {
                            return handleLanguageChange(e);
                        },
                        onClick: function onClick(e) {
                            return e.nativeEvent.stopImmediatePropagation();
                        },
                        className: 'language'
                    },
                    _react2.default.createElement(
                        'option',
                        { value: 'en' },
                        'English'
                    ),
                    _react2.default.createElement(
                        'option',
                        { value: 'es' },
                        'Spanish Espa\xF1ol'
                    ),
                    _react2.default.createElement(
                        'option',
                        { value: 'ru' },
                        'Russian \u0440\u0443\u0441\u0441\u043A\u0438\u0439'
                    ),
                    _react2.default.createElement(
                        'option',
                        { value: 'fr' },
                        'French fran\xE7ais'
                    ),
                    _react2.default.createElement(
                        'option',
                        { value: 'it' },
                        'Italian italiano'
                    ),
                    _react2.default.createElement(
                        'option',
                        { value: 'ko' },
                        'Korean \uD55C\uAD6D\uC5B4'
                    ),
                    _react2.default.createElement(
                        'option',
                        { value: 'ja' },
                        'Japanese \u65E5\u672C\u8A9E'
                    ),
                    _react2.default.createElement(
                        'option',
                        { value: 'pl' },
                        'Polish'
                    )
                )
            );
        }
        if (isExternal) {
            return _react2.default.createElement(
                'li',
                { key: ix, className: cn },
                _react2.default.createElement(
                    'a',
                    { href: i.link, target: '_blank', rel: 'noopener noreferrer' },
                    i.label,
                    '\xA0',
                    _react2.default.createElement(_Icon2.default, { name: 'extlink' })
                )
            );
        }
        if (i.onClick) {
            return _react2.default.createElement(
                'li',
                { key: ix, className: cn },
                _react2.default.createElement(
                    'a',
                    { onClick: i.onClick },
                    i.label
                )
            );
        }
        return _react2.default.createElement(
            'li',
            { key: ix, className: cn },
            _react2.default.createElement(
                _reactRouter.Link,
                { to: i.link },
                i.label
            )
        );
    };

    var sidePanelLinks = {
        internal: [{
            label: (0, _counterpart2.default)('navigation.welcome'),
            link: '/welcome'
        }, {
            label: (0, _counterpart2.default)('navigation.language'),
            link: '/',
            key: 'switchLanguage'
        }, {
            label: (0, _counterpart2.default)('navigation.faq'),
            link: '/faq.html'
        },
        /*
        {
            label: tt('navigation.explore'),
            link: `/communities`,
        },
        */
        {
            label: nightmode ? (0, _counterpart2.default)('g.toggle_daymode') : (0, _counterpart2.default)('g.toggle_nightmode'),
            link: '/',
            onClick: toggleNightmode
        }],
        exchanges: [{
            value: 'poloniex',
            label: 'Poloniex',
            link: 'https://poloniex.com/exchange#trx_steem'
        }],
        wallet: [{
            label: (0, _counterpart2.default)('navigation.stolen_account_recovery'),
            link: walletUrl + '/recover_account_step_1'
        }, {
            label: (0, _counterpart2.default)('navigation.change_account_password'),
            link: walletUrl + '/change_password'
        }, {
            label: (0, _counterpart2.default)('navigation.vote_for_witnesses'),
            link: walletUrl + '/~witnesses'
        }, {
            label: (0, _counterpart2.default)('navigation.steem_proposals'),
            link: walletUrl + '/proposals'
        }],

        external: [
        /*
        {
            label: tt('navigation.chat'),
            link: 'https://steem.chat/home',
        },
        */
        {
            label: (0, _counterpart2.default)('navigation.advertise'),
            link: 'https://selfserve.steemit.com'
        }, {
            label: (0, _counterpart2.default)('navigation.jobs'),
            link: 'https://recruiting.paylocity.com/recruiting/jobs/List/3288/Steemit-Inc'
        }],

        organizational: [{
            label: (0, _counterpart2.default)('navigation.api_docs'),
            link: 'https://developers.steem.io/'
        }, {
            label: (0, _counterpart2.default)('navigation.bluepaper'),
            link: 'https://steem.io/steem-bluepaper.pdf'
        }, {
            label: (0, _counterpart2.default)('navigation.smt_whitepaper'),
            link: 'https://smt.steem.io/'
        }, {
            label: (0, _counterpart2.default)('navigation.whitepaper'),
            link: 'https://steem.com/SteemWhitePaper.pdf'
        }],

        legal: [{
            label: (0, _counterpart2.default)('navigation.privacy_policy'),
            link: '/privacy.html'
        }, {
            label: (0, _counterpart2.default)('navigation.terms_of_service'),
            link: '/tos.html'
        }],

        extras: [{
            label: (0, _counterpart2.default)('g.sign_in'),
            link: '/login.html'
        }, {
            label: (0, _counterpart2.default)('g.sign_up'),
            link: 'https://signup.steemit.com'
        }]
    };

    return _react2.default.createElement(
        'div',
        { className: 'SidePanel' },
        _react2.default.createElement(
            'div',
            { className: (visible ? 'visible ' : '') + alignment },
            _react2.default.createElement(_CloseButton2.default, { onClick: hideSidePanel }),
            _react2.default.createElement(
                'ul',
                { className: 'vertical menu ' + loggedIn },
                sidePanelLinks.extras.map(makeLink)
            ),
            _react2.default.createElement(
                'ul',
                { className: 'vertical menu' },
                sidePanelLinks.internal.map(makeLink)
            ),
            _react2.default.createElement(
                'ul',
                { className: 'vertical menu' },
                sidePanelLinks.wallet.map(makeLink)
            ),
            _react2.default.createElement(
                'ul',
                { className: 'vertical menu' },
                _react2.default.createElement(
                    'li',
                    null,
                    _react2.default.createElement(
                        'a',
                        { className: 'menu-section' },
                        (0, _counterpart2.default)('navigation.third_party_exchanges')
                    )
                ),
                sidePanelLinks.exchanges.map(makeLink)
            ),
            _react2.default.createElement(
                'ul',
                { className: 'vertical menu' },
                sidePanelLinks.external.map(makeLink)
            ),
            _react2.default.createElement(
                'ul',
                { className: 'vertical menu' },
                sidePanelLinks.organizational.map(makeLink)
            ),
            _react2.default.createElement(
                'ul',
                { className: 'vertical menu' },
                sidePanelLinks.legal.map(makeLink)
            )
        )
    );
};

SidePanel.propTypes = {
    alignment: _propTypes2.default.oneOf(['left', 'right']).isRequired,
    visible: _propTypes2.default.bool.isRequired,
    hideSidePanel: _propTypes2.default.func.isRequired,
    username: _propTypes2.default.string,
    toggleNightmode: _propTypes2.default.func.isRequired
};

SidePanel.defaultProps = {
    username: undefined
};

exports.default = (0, _reactRedux.connect)(function (state, ownProps) {
    var walletUrl = state.app.get('walletUrl');
    var nightmode = state.app.getIn(['user_preferences', 'nightmode']);
    return (0, _extends3.default)({
        walletUrl: walletUrl,
        nightmode: nightmode,
        user_preferences: state.app.get('user_preferences').toJS()
    }, ownProps);
}, function (dispatch) {
    return {
        toggleNightmode: function toggleNightmode(e) {
            if (e) e.preventDefault();
            dispatch(appActions.toggleNightmode());
        },
        setUserPreferences: function setUserPreferences(payload) {
            dispatch(appActions.setUserPreferences(payload));
        }
    };
})(SidePanel);