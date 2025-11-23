'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

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

var _reactRouter = require('react-router');

var _counterpart = require('counterpart');

var _counterpart2 = _interopRequireDefault(_counterpart);

var _emit = require('app/utils/emit');

var _SearchHistory = require('./SearchHistory');

var _SearchHistory2 = _interopRequireDefault(_SearchHistory);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ElasticSearchInput = (_temp = _class = function (_React$Component) {
    (0, _inherits3.default)(ElasticSearchInput, _React$Component);

    function ElasticSearchInput(props) {
        (0, _classCallCheck3.default)(this, ElasticSearchInput);

        var _this = (0, _possibleConstructorReturn3.default)(this, (ElasticSearchInput.__proto__ || (0, _getPrototypeOf2.default)(ElasticSearchInput)).call(this, props));

        _this.onSearchSubmit = function (e) {
            e.preventDefault();
            e.stopPropagation();
            var _this$props = _this.props,
                handleSubmit = _this$props.handleSubmit,
                redirect = _this$props.redirect;

            handleSubmit && handleSubmit(_this.state.value);
            redirect && _reactRouter.browserHistory.push('/search?q=' + _this.state.value.replace(/%/g, '%25'));
            _emit.emit.emit('query_change', _this.state.value);
            if (process.env.BROWSER) {
                var history = window.localStorage.getItem('steemit_search');
                if (_this.state.value.trim() === '') return;
                if (!history) {
                    window.localStorage.setItem('steemit_search', _this.state.value);
                } else {
                    var historyArr = history.split(',');
                    if (historyArr.includes(_this.state.value)) {
                        historyArr.splice(historyArr.indexOf(_this.state.value), 1);
                        historyArr.unshift(_this.state.value);
                        window.localStorage.setItem('steemit_search', historyArr.join(','));
                    } else {
                        window.localStorage.setItem('steemit_search', _this.state.value + ',' + history);
                    }
                }
            }
        };

        _this.state = {
            value: _this.props.initValue ? _this.props.initValue : '',
            showHistory: false
        };
        _this.handleChange = _this.handleChange.bind(_this);
        _this.onSearchSubmit = _this.onSearchSubmit.bind(_this);
        _this.setSearchText = _this.setSearchText.bind(_this);
        _this.changeHistory = _this.changeHistory.bind(_this);
        return _this;
    }

    (0, _createClass3.default)(ElasticSearchInput, [{
        key: 'changeHistory',
        value: function changeHistory(display) {
            this.setState({
                showHistory: display
            });
        }
    }, {
        key: 'handleChange',
        value: function handleChange(event) {
            this.setSearchText(event.target.value);
        }
    }, {
        key: 'setSearchText',
        value: function setSearchText(value) {
            this.setState({ value: value });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var formClass = this.props.expanded ? 'search-input--expanded' : 'search-input';
            return _react2.default.createElement(
                'span',
                null,
                _react2.default.createElement(
                    'form',
                    {
                        className: formClass,
                        onSubmit: function onSubmit(e) {
                            _this2.onSearchSubmit(e);
                        }
                    },
                    _react2.default.createElement(
                        'svg',
                        {
                            className: 'search-input__icon',
                            width: '42',
                            height: '42',
                            viewBox: '0 0 32 32',
                            version: '1.1',
                            xmlns: 'http://www.w3.org/2000/svg',
                            onClick: function onClick(e) {
                                _this2.onSearchSubmit(e);
                            }
                        },
                        _react2.default.createElement(
                            'g',
                            null,
                            _react2.default.createElement('path', {
                                className: 'search-input__path',
                                d: 'M14.3681591,18.5706017 L11.3928571,21.6 L14.3681591,18.5706017 C13.273867,17.6916019 12.5714286,16.3293241 12.5714286,14.8 C12.5714286,12.1490332 14.6820862,10 17.2857143,10 C19.8893424,10 22,12.1490332 22,14.8 C22,17.4509668 19.8893424,19.6 17.2857143,19.6 C16.1841009,19.6 15.1707389,19.215281 14.3681591,18.5706017 Z',
                                id: 'icon-svg'
                            })
                        )
                    ),
                    _react2.default.createElement('input', {
                        name: 'q',
                        className: 'search-input__inner',
                        type: 'search',
                        placeholder: (0, _counterpart2.default)('g.search'),
                        onChange: this.handleChange,
                        value: this.state.value,
                        autoComplete: 'off',
                        onFocus: function onFocus() {
                            return _this2.changeHistory(true);
                        },
                        onBlur: function onBlur() {
                            return setTimeout(function () {
                                _this2.changeHistory(false);
                            }, 200);
                        }
                    }),
                    this.props.addHistory && _react2.default.createElement(_SearchHistory2.default, {
                        show: this.state.showHistory,
                        changeHistory: this.changeHistory,
                        setSearchText: this.setSearchText
                    })
                )
            );
        }
    }]);
    return ElasticSearchInput;
}(_react2.default.Component), _class.propTypes = {
    redirect: _propTypes2.default.bool.isRequired,
    handleSubmit: _propTypes2.default.func,
    expanded: _propTypes2.default.bool,
    initValue: _propTypes2.default.string
}, _class.defaultProps = {
    handleSubmit: null,
    expanded: true,
    initValue: ''
}, _temp);
exports.default = ElasticSearchInput;