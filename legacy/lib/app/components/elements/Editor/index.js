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

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var EditorMd = function (_React$Component) {
    (0, _inherits3.default)(EditorMd, _React$Component);

    function EditorMd(props) {
        (0, _classCallCheck3.default)(this, EditorMd);

        var _this = (0, _possibleConstructorReturn3.default)(this, (EditorMd.__proto__ || (0, _getPrototypeOf2.default)(EditorMd)).call(this, props));

        _this.handleChange = function () {
            var cm = _this.state.cm;

            _this.props.onChange(cm.getMarkdown());
        };

        _this.state = {
            theme: 'snow',
            cm: null
        };
        return _this;
    }

    (0, _createClass3.default)(EditorMd, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this2 = this;

            var config = {
                id: this.props.editorId,
                width: '100%',
                height: 700,
                path: '/assets/plugins/editor.md/lib/',
                markdown: this.props.content,
                placeholder: this.props.placeholder,
                codeFold: true,
                saveHTMLToTextarea: false,
                searchReplace: true,
                toolbarIcons: function toolbarIcons() {
                    return ['undo', 'redo', '|', 'link', 'reference-link', 'custom-image', 'code', 'code-block', 'table', 'pagebreak', '|', 'bold', 'del', 'italic', 'quote', '|', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', '|', 'list-ul', 'list-ol', 'hr', '|', 'goto-line', 'clear', 'search', 'preview', 'watch'];
                },
                toolbarIconsClass: {
                    'custom-image': 'fa fa-picture-o'
                },
                toolbarIconTexts: {
                    'custom-image': 'Upload'
                },
                toolbarHandlers: {
                    'custom-image': function customImage(cm, icon, cursor, selection) {
                        _this2.props.customUpload();
                    }
                },
                emoji: true,
                onload: function onload() {
                    _this2.props.onLoaded(_this2.state.cm);
                },
                onchange: this.handleChange
            };
            this.setState({
                cm: editormd(this.props.editorId, config)
            });
        }
    }, {
        key: 'render',
        value: function render() {
            return _react2.default.createElement('div', { id: this.props.editorId });
        }
    }]);
    return EditorMd;
}(_react2.default.Component);

exports.default = EditorMd;


EditorMd.propTypes = {
    editorId: _propTypes2.default.string,
    placeholder: _propTypes2.default.string,
    onChange: _propTypes2.default.func,
    customUpload: _propTypes2.default.func,
    onLoaded: _propTypes2.default.func,
    content: _propTypes2.default.string
};