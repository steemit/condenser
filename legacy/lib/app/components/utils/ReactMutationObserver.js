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

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * React wrapper to do some actions upon changes in the DOM
 */
var ReactMutationObserver = function (_React$Component) {
    (0, _inherits3.default)(ReactMutationObserver, _React$Component);

    function ReactMutationObserver(props) {
        (0, _classCallCheck3.default)(this, ReactMutationObserver);

        var _this = (0, _possibleConstructorReturn3.default)(this, (ReactMutationObserver.__proto__ || (0, _getPrototypeOf2.default)(ReactMutationObserver)).call(this, props));

        _this.observerConfig = {
            attributes: false,
            childList: false,
            subtree: false,
            characterData: false
        };
        _this.observer = null;
        _this.onChildListChanged = null;
        _this.onAttributesChanged = null;
        _this.onSubtreeChanged = null;
        _this.onCharacterDataChanged = null;
        var _props$onChildListCha = props.onChildListChanged,
            onChildListChanged = _props$onChildListCha === undefined ? null : _props$onChildListCha,
            _props$onAttributesCh = props.onAttributesChanged,
            onAttributesChanged = _props$onAttributesCh === undefined ? null : _props$onAttributesCh,
            _props$onSubtreeChang = props.onSubtreeChanged,
            onSubtreeChanged = _props$onSubtreeChang === undefined ? null : _props$onSubtreeChang,
            _props$onCharacterDat = props.onCharacterDataChanged,
            onCharacterDataChanged = _props$onCharacterDat === undefined ? null : _props$onCharacterDat;

        var me = _this;

        _this.initObserver = _this.initObserver.bind(_this);
        _this.disconnect = _this.disconnect.bind(_this);

        me.onChildListChanged = onChildListChanged;
        me.onAttributesChanged = onAttributesChanged;
        me.onSubtreeChanged = onSubtreeChanged;
        me.onCharacterDataChanged = onCharacterDataChanged;

        if (me.onChildListChanged !== null) {
            me.observerConfig.childList = true;
            me.observerConfig.subtree = true;
        }

        if (me.onAttributesChanged !== null) {
            me.observerConfig.attributes = true;
        }

        if (me.onSubtreeChanged !== null) {
            me.observerConfig.subtree = true;
        }

        if (me.onCharacterDataChanged !== null) {
            me.observerConfig.characterData = true;
        }

        if (typeof MutationObserver !== 'undefined') {
            _this.observer = new MutationObserver(function (mutations) {
                mutations.forEach(function (mutation) {
                    if (mutation.type === 'childList' && typeof me.onChildListChanged === 'function') {
                        me.onChildListChanged(mutation, me.disconnect);
                    }

                    if (mutation.type === 'attributes' && typeof me.onAttributesChanged === 'function') {
                        me.onAttributesChanged(mutation, me.disconnect);
                    }

                    if (mutation.type === 'subtree' && typeof me.onSubtreeChanged === 'function') {
                        me.onSubtreeChanged(mutation, me.disconnect);
                    }

                    if (mutation.type === 'characterData' && typeof me.onCharacterDataChanged === 'function') {
                        me.onCharacterDataChanged(mutation, me.disconnect);
                    }
                });
            });
        }
        return _this;
    }

    (0, _createClass3.default)(ReactMutationObserver, [{
        key: 'disconnect',
        value: function disconnect() {
            if (typeof MutationObserver !== 'undefined') {
                this.observer.disconnect();
            }
        }
    }, {
        key: 'initObserver',
        value: function initObserver(componentElement) {
            if (typeof MutationObserver !== 'undefined' && componentElement !== null) {
                this.observer.observe(componentElement, this.observerConfig);
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var children = this.props.children;


            return _react2.default.createElement(
                'div',
                { ref: this.initObserver },
                children
            );
        }
    }]);
    return ReactMutationObserver;
}(_react2.default.Component);

exports.default = ReactMutationObserver;