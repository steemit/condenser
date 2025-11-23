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

var _class, _temp;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _MarkdownViewer = require('app/components/cards/MarkdownViewer');

var _MarkdownViewer2 = _interopRequireDefault(_MarkdownViewer);

var _Icon = require('app/components/elements/Icon');

var _Icon2 = _interopRequireDefault(_Icon);

var _server = require('react-dom/server');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

if (!process.env.BROWSER) {
    var getFolderContents = function getFolderContents(folder, recursive) {
        return fs.readdirSync(folder).reduce(function (list, file) {
            var name = path.resolve(folder, file);
            var isDir = fs.statSync(name).isDirectory();
            return list.concat(isDir && recursive ? getFolderContents(name, recursive) : [name]);
        }, []);
    };

    var requireContext = function requireContext(folder, recursive, pattern) {
        var normalizedFolder = path.resolve(path.dirname(module.filename), folder);
        var folderContents = cache[folder] = cache[folder] ? cache[folder] : getFolderContents(normalizedFolder, recursive).filter(function (item) {
            if (item === module.filename) return false;
            return pattern.test(item);
        });

        var keys = function keys() {
            return folderContents;
        };
        var returnContext = function returnContext(item) {
            return cache[item] = cache[item] ? cache[item] : fs.readFileSync(item, 'utf8');
        };
        returnContext.keys = keys;
        return returnContext;
    };

    var cache = {};
    // please note we don't need to define require.context for client side rendering because it's defined by webpack
    var path = require('path');
    var fs = require('fs');

    require.context = requireContext;
}

var req = require.context('../../help', true, /\.md/);
var HelpData = {};

function split_into_sections(str) {
    var sections = str.split(/\[#\s?(.+?)\s?\]/);
    if (sections.length === 1) return sections[0];
    if (sections[0].length < 4) sections.splice(0, 1);
    sections = sections.reduce(function (result, n) {
        var last = result.length > 0 ? result[result.length - 1] : null;
        if (!last || last.length === 2) {
            last = [n];
            result.push(last);
        } else last.push(n);
        return result;
    }, []);
    return sections.reduce(function (result, n) {
        result[n[0]] = n[1];
        return result;
    }, {});
}

var HelpContent = (_temp = _class = function (_React$Component) {
    (0, _inherits3.default)(HelpContent, _React$Component);

    function HelpContent(props) {
        (0, _classCallCheck3.default)(this, HelpContent);

        var _this = (0, _possibleConstructorReturn3.default)(this, (HelpContent.__proto__ || (0, _getPrototypeOf2.default)(HelpContent)).call(this, props));

        _this.locale = 'en';
        return _this;
    }

    (0, _createClass3.default)(HelpContent, [{
        key: 'componentWillMount',
        value: function componentWillMount() {
            var _this2 = this;

            var md_file_path_regexp = new RegExp('/' + this.locale + '/(.+).md$');
            req.keys().filter(function (a) {
                return a.indexOf('/' + _this2.locale + '/') !== -1;
            }).forEach(function (filename) {
                var res = filename.match(md_file_path_regexp);
                var key = res[1];
                var help_locale = HelpData[_this2.locale];
                if (!help_locale) HelpData[_this2.locale] = help_locale = {};
                var content = req(filename);
                help_locale[key] = split_into_sections(content);
            });
        }
    }, {
        key: 'setVars',
        value: function setVars(str) {
            var _this3 = this;

            return str.replace(/(\{.+?\})/gi, function (match, text) {
                var key = text.substr(1, text.length - 2);
                var value = _this3.props[key] !== undefined ? _this3.props[key] : text;
                return value;
            });
        }
    }, {
        key: 'render',
        value: function render() {
            if (!HelpData[this.locale]) {
                console.error('missing locale \'' + this.locale + '\' help files');
                return null;
            }
            var value = HelpData[this.locale][this.props.path];
            if (!value && this.locale !== 'en') {
                console.warn('missing path \'' + this.props.path + '\' for locale \'' + this.locale + '\' help files, rolling back to \'en\'');
                value = HelpData['en'][this.props.path];
            }
            if (!value) {
                console.error('help file not found \'' + this.props.path + '\' for locale \'' + this.locale + '\'');
                return null;
            }
            if (this.props.section) value = value[this.props.section];
            if (!value) {
                console.error('help section not found ' + this.props.path + '#' + this.props.section);
                return null;
            }
            value = this.setVars(value);
            value = value.replace(/<Icon name="([A-Za-z0-9\_\-]+)" \/>/gi, function (match, name) {
                return (0, _server.renderToString)(_react2.default.createElement(_Icon2.default, { name: name }));
            });
            var title = null;
            if (this.props.title) {
                title = _react2.default.createElement(
                    'h1',
                    null,
                    this.props.title
                );
            }

            return _react2.default.createElement(
                'div',
                null,
                title,
                _react2.default.createElement(_MarkdownViewer2.default, {
                    className: 'HelpContent',
                    text: value,
                    allowDangerousHTML: true,
                    breaks: false
                })
            );
        }
    }]);
    return HelpContent;
}(_react2.default.Component), _class.propTypes = {
    path: _propTypes2.default.string.isRequired,
    section: _propTypes2.default.string,
    title: _propTypes2.default.string
}, _temp);
exports.default = HelpContent;