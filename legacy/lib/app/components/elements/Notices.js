'use strict';

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _counterpart = require('counterpart');

var _counterpart2 = _interopRequireDefault(_counterpart);

var _reactRouter = require('react-router');

var _TimeAgoWrapper = require('app/components/elements/TimeAgoWrapper');

var _TimeAgoWrapper2 = _interopRequireDefault(_TimeAgoWrapper);

var _reactRedux = require('react-redux');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Notice = function Notice(_ref) {
    var notice = _ref.notice;

    if (!notice || !notice.title) {
        return null;
    }

    var url = '/' + notice.category + '/@' + notice.author + '/' + notice.permlink;
    var tag = notice.tag ? _react2.default.createElement(
        'p',
        { className: 'Notices__featured' },
        notice.tag
    ) : null;
    var title = url ? _react2.default.createElement(
        _reactRouter.Link,
        { className: 'Notices__title-link', to: url },
        notice.title
    ) : notice.title;
    var by = notice.author ? _react2.default.createElement(
        'span',
        { className: 'Notices__by' },
        ' ',
        (0, _counterpart2.default)('g.by'),
        '\xA0'
    ) : null;
    var author = notice.author ? _react2.default.createElement(
        _reactRouter.Link,
        { className: 'Notices__author-link', to: '/@' + notice.author },
        notice.author
    ) : null;
    var date = notice.created ? _react2.default.createElement(
        'span',
        null,
        ' . ',
        _react2.default.createElement(_TimeAgoWrapper2.default, { date: notice.created })
    ) : null;

    return _react2.default.createElement(
        'li',
        { className: 'Notices__notice' },
        tag,
        _react2.default.createElement(
            'p',
            { className: 'Notices__title' },
            title
        ),
        _react2.default.createElement(
            'p',
            { className: 'Notices__metadata' },
            by,
            author,
            date
        )
    );
};

var SteemitNotices = function SteemitNotices(_ref2) {
    var notices = _ref2.notices;

    if (!notices || notices.length === 0) {
        return null;
    }

    return _react2.default.createElement(
        'div',
        { className: 'c-sidebar__module' },
        _react2.default.createElement(
            'div',
            { className: 'c-sidebar__header' },
            _react2.default.createElement(
                'h3',
                { className: 'c-sidebar__h3' },
                'Updates Log'
            )
        ),
        _react2.default.createElement(
            'div',
            { className: 'c-sidebar__content' },
            _react2.default.createElement(
                'ul',
                { className: 'Notices' },
                notices.map(function (notice, i) {
                    return _react2.default.createElement(Notice, { key: i, notice: notice });
                })
            )
        )
    );
};

module.exports = (0, _reactRedux.connect)(function (state) {
    return {
        notices: state.offchain.get('special_posts').get('notices').toJS()
    };
})(SteemitNotices);