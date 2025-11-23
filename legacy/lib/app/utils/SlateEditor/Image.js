'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

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

var _reactRedux = require('react-redux');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = (0, _reactRedux.connect)(function (state, ownProps) {
    return ownProps;
}, function (dispatch) {
    return {
        uploadImage: function uploadImage(file, dataUrl, filename, progress) {
            dispatch({
                type: 'user/UPLOAD_IMAGE',
                payload: { file: file, dataUrl: dataUrl, filename: filename, progress: progress }
            });
        }
    };
})(function (_React$Component) {
    (0, _inherits3.default)(Image, _React$Component);

    function Image() {
        var _ref;

        var _temp, _this, _ret;

        (0, _classCallCheck3.default)(this, Image);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = (0, _possibleConstructorReturn3.default)(this, (_ref = Image.__proto__ || (0, _getPrototypeOf2.default)(Image)).call.apply(_ref, [this].concat(args))), _this), _this.state = {
            progress: {}
        }, _this.load = function () {
            var dataUrl = void 0,
                filename = void 0;
            var file = _this.state.file;

            if (file) {
                // image dropped -- show a quick preview
                console.log('** image being loaded.. ----->', file);
                var reader = new FileReader();
                reader.addEventListener('load', function () {
                    dataUrl = reader.result;
                    _this.setImageSrc(dataUrl, file.name);
                });
                reader.readAsDataURL(file);
                filename = file.name;
            } else {
                // draft, recover data using the preview data url
                var data = _this.props.node.data;

                var src = data.get('src');
                if (/^data:/.test(src)) {
                    dataUrl = src;
                    filename = data.get('alt');
                }
            }

            if (!file && !dataUrl) return;
            _this.setState({ progress: {}, uploading: true }, function () {
                var uploadImage = _this.props.uploadImage;

                uploadImage(file, dataUrl, filename, function (progress) {
                    _this.setState({ progress: progress, uploading: false });
                    if (progress.url) {
                        _this.setImageSrc(progress.url, filename);
                    }
                });
            });
        }, _temp), (0, _possibleConstructorReturn3.default)(_this, _ret);
    }

    (0, _createClass3.default)(Image, [{
        key: 'componentWillMount',
        value: function componentWillMount() {
            var file = this.props.node.data.get('file');
            // Save `file` for "Retry"
            // Try to load incase data url was loaded from a draft
            this.setState({ file: file });
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            console.log('** image mounted..', this.state, this.props);
            this.load();
        }
    }, {
        key: 'setImageSrc',
        value: function setImageSrc(src, filename) {
            var _props = this.props,
                editor = _props.editor,
                node = _props.node;

            var state = editor.getState();
            var next = state.transform().setNodeByKey(node.key, { data: { src: src, alt: filename } }).apply();
            editor.onChange(next);
        }
    }, {
        key: 'render',
        value: function render() {
            var _props2 = this.props,
                node = _props2.node,
                state = _props2.state,
                attributes = _props2.attributes;


            var isFocused = state.selection.hasEdgeIn(node);
            var className = isFocused ? 'active' : null;

            var prefix = $STM_Config.img_proxy_prefix ? $STM_Config.img_proxy_prefix + '0x0/' : '';

            var alt = node.data.get('alt');
            var src = node.data.get('src');

            console.log('** rendering image... src:', src ? src.substring(0, 30) + '...' : '(null)', state);

            if (!src) return _react2.default.createElement(
                'small',
                { className: 'info' },
                'Loading Image\u2026'
            );

            if (/^https?:\/\//.test(src)) return _react2.default.createElement('img', (0, _extends3.default)({}, attributes, {
                src: prefix + src,
                alt: alt,
                className: className
            }));

            var img = _react2.default.createElement('img', { src: src, alt: alt, className: className });

            var uploading = this.state.uploading;

            if (uploading) return _react2.default.createElement(
                'div',
                attributes,
                img,
                _react2.default.createElement('br', null),
                _react2.default.createElement(
                    'small',
                    { className: 'info' },
                    'Uploading Image\u2026'
                )
            );

            var error = this.state.progress.error;

            return _react2.default.createElement(
                'div',
                attributes,
                img,
                _react2.default.createElement(
                    'div',
                    { className: 'error' },
                    _react2.default.createElement(
                        'small',
                        null,
                        'Image was not Saved (',
                        _react2.default.createElement(
                            'a',
                            { onClick: this.load },
                            'retry'
                        ),
                        ')',
                        _react2.default.createElement('br', null),
                        error
                    )
                )
            );
        }
    }]);
    return Image;
}(_react2.default.Component));