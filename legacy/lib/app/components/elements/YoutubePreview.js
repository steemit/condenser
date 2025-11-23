'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = undefined;

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

var _class, _temp; /* eslint react/prop-types: 0 */


var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _shouldComponentUpdate = require('app/utils/shouldComponentUpdate');

var _shouldComponentUpdate2 = _interopRequireDefault(_shouldComponentUpdate);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var string = _propTypes2.default.string,
    number = _propTypes2.default.number;

/** Lots of iframes in a post can be very slow.  This component only inserts the iframe when it is actually needed. */

var YoutubePreview = (_temp = _class = function (_React$Component) {
    (0, _inherits3.default)(YoutubePreview, _React$Component);

    function YoutubePreview() {
        (0, _classCallCheck3.default)(this, YoutubePreview);

        var _this = (0, _possibleConstructorReturn3.default)(this, (YoutubePreview.__proto__ || (0, _getPrototypeOf2.default)(YoutubePreview)).call(this));

        _this.shouldComponentUpdate = (0, _shouldComponentUpdate2.default)(_this, 'YoutubePreview');

        _this.onPlay = function () {
            _this.setState({ play: true });
        };

        _this.state = {};
        return _this;
    }

    (0, _createClass3.default)(YoutubePreview, [{
        key: 'render',
        value: function render() {
            var _props = this.props,
                youTubeId = _props.youTubeId,
                width = _props.width,
                height = _props.height,
                startTime = _props.startTime,
                dataParams = _props.dataParams;
            var play = this.state.play;

            if (!play) {
                // mqdefault.jpg (medium quality version, 320px × 180px)
                // hqdefault.jpg (high quality version, 480px × 360px
                // sddefault.jpg (standard definition version, 640px × 480px)
                var thumbnail = width <= 320 ? 'mqdefault.jpg' : width <= 480 ? 'hqdefault.jpg' : '0.jpg';
                var previewLink = 'https://img.youtube.com/vi/' + youTubeId + '/' + thumbnail;
                return _react2.default.createElement(
                    'div',
                    {
                        className: 'videoWrapper youtube',
                        onClick: this.onPlay,
                        style: { backgroundImage: 'url(' + previewLink + ')' }
                    },
                    _react2.default.createElement('div', { className: 'play' })
                );
            }
            var autoPlaySrc = 'https://www.youtube.com/embed/' + youTubeId + '?autoplay=1&autohide=1&' + dataParams + '&start=' + startTime;
            return _react2.default.createElement(
                'div',
                { className: 'videoWrapper' },
                _react2.default.createElement('iframe', {
                    width: width,
                    height: height,
                    src: autoPlaySrc,
                    frameBorder: '0',
                    allowFullScreen: 'true'
                })
            );
        }
    }]);
    return YoutubePreview;
}(_react2.default.Component), _class.propTypes = {
    youTubeId: string.isRequired,
    width: number,
    height: number,
    startTime: number,
    dataParams: string
}, _class.defaultProps = {
    width: 640,
    height: 360,
    startTime: 0,
    dataParams: 'enablejsapi=0&rel=0&origin=https://steemit.com'
}, _temp);
exports.default = YoutubePreview;