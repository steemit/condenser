'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _counterpart = require('counterpart');

var _counterpart2 = _interopRequireDefault(_counterpart);

var _reactRouter = require('react-router');

var _NativeSelect = require('app/components/elements/NativeSelect');

var _NativeSelect2 = _interopRequireDefault(_NativeSelect);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SortOrder = function SortOrder(_ref) {
    var topic = _ref.topic,
        sortOrder = _ref.sortOrder,
        horizontal = _ref.horizontal,
        pathname = _ref.pathname;

    var tag = topic || '';
    var sort = sortOrder;

    if (sort === 'feed') {
        tag = '';
        sort = 'created';
    }

    if (pathname === '/') {
        tag = '';
        sort = 'trending';
    }

    var sorts = function sorts(tag) {
        var topMenu = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

        if (tag != '') tag = '/' + tag;

        var out = [{
            label: (0, _counterpart2.default)('main_menu.trending'),
            value: '/trending' + tag /*
                                     {
                                       label: tt('main_menu.hot'),
                                       value: `/hot${tag}`,
                                     },*/
        }];

        if (!topMenu) {
            out.push({
                label: (0, _counterpart2.default)('g.new'),
                value: '/created' + tag
            });

            /*
            out.push({
                label: tt('g.promoted'),
                value: `/promoted${tag}`,
            });
            */

            out.push({
                label: (0, _counterpart2.default)('g.payouts'),
                value: '/payout' + tag
            });

            out.push({
                label: 'Muted',
                value: '/muted' + tag
            });
        }

        return out;
    };

    // vertical dropdown
    if (!horizontal) {
        var url = function url(sort) {
            var tag = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
            return tag ? '/' + sort + '/' + tag : '/' + sort;
        };
        return _react2.default.createElement(_NativeSelect2.default, {
            currentlySelected: url(sort, tag),
            options: sorts(tag, false),
            onChange: function onChange(el) {
                return _reactRouter.browserHistory.replace(el.value);
            }
        });
    }

    // site header
    return _react2.default.createElement(
        'ul',
        { className: 'nav__block-list' },
        sorts('', true).map(function (i) {
            var active = i.value === '/' + sort;
            var cls = active ? 'nav__block-list-item--active' : '';
            return _react2.default.createElement(
                'li',
                { key: i.value, className: 'nav__block-list-item ' + cls },
                _react2.default.createElement(
                    _reactRouter.Link,
                    { to: i.value },
                    i.label
                )
            );
        })
    );
};

SortOrder.propTypes = {
    topic: _propTypes2.default.string,
    sortOrder: _propTypes2.default.string,
    horizontal: _propTypes2.default.bool,
    pathname: _propTypes2.default.string
};

SortOrder.defaultProps = {
    horizontal: false,
    topic: '',
    sortOrder: '',
    pathname: ''
};

exports.default = SortOrder;