'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.SIZE_LARGE = exports.SIZE_MED = exports.SIZE_SMALL = undefined;

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _reactRedux = require('react-redux');

var _ProxifyUrl = require('app/utils/ProxifyUrl');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SIZE_SMALL = exports.SIZE_SMALL = 'small';
var SIZE_MED = exports.SIZE_MED = 'medium';
var SIZE_LARGE = exports.SIZE_LARGE = 'large';

var sizeList = [SIZE_SMALL, SIZE_MED, SIZE_LARGE];

var Userpic = function (_Component) {
    (0, _inherits3.default)(Userpic, _Component);

    function Userpic() {
        (0, _classCallCheck3.default)(this, Userpic);
        return (0, _possibleConstructorReturn3.default)(this, (Userpic.__proto__ || (0, _getPrototypeOf2.default)(Userpic)).apply(this, arguments));
    }

    (0, _createClass3.default)(Userpic, [{
        key: 'render',
        value: function render() {
            if (this.props.hide) return null;

            var _props = this.props,
                account = _props.account,
                size = _props.size;

            var url = (0, _ProxifyUrl.imageProxy)() + ('u/' + account + '/avatar' + size);
            var style = { backgroundImage: 'url(' + url + ')' };
            return _react2.default.createElement('div', { className: 'Userpic', style: style });
        }
    }]);
    return Userpic;
}(_react.Component);

Userpic.propTypes = {
    account: _propTypes2.default.string.isRequired
};

exports.default = (0, _reactRedux.connect)(function (state, ownProps) {
    var account = ownProps.account,
        size = ownProps.size,
        hideIfDefault = ownProps.hideIfDefault;


    var hide = false;
    if (hideIfDefault) {
        var url = state.userProfiles.getIn(['profiles', account, 'metadata', 'profile', 'profile_image'], null);
        hide = !url || !/^(https?:)\/\//.test(url);
    }

    return {
        account: account == 'steemitblog' ? 'steemitdev' : account,
        size: size && sizeList.indexOf(size) > -1 ? '/' + size : '',
        hide: hide
    };
})(Userpic);