'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = exports.getDemoState = exports.deserializeHtml = exports.serializeHtml = undefined;

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _class, _temp, _initialiseProps;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _slate = require('slate');

var _slate2 = _interopRequireDefault(_slate);

var _reactPortal = require('react-portal');

var _reactPortal2 = _interopRequireDefault(_reactPortal);

var _selectionPosition = require('selection-position');

var _selectionPosition2 = _interopRequireDefault(_selectionPosition);

var _Icon = require('app/components/elements/Icon');

var _Icon2 = _interopRequireDefault(_Icon);

var _server = require('react-dom/server');

var _server2 = _interopRequireDefault(_server);

var _Helpers = require('app/utils/SlateEditor/Helpers');

var _DemoState = require('app/utils/SlateEditor/DemoState');

var _DemoState2 = _interopRequireDefault(_DemoState);

var _Schema = require('app/utils/SlateEditor/Schema');

var _slateInsertBlockOnEnter = require('slate-insert-block-on-enter');

var _slateInsertBlockOnEnter2 = _interopRequireDefault(_slateInsertBlockOnEnter);

var _slateTrailingBlock = require('slate-trailing-block');

var _slateTrailingBlock2 = _interopRequireDefault(_slateTrailingBlock);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var serializer = new _slate.Html({ rules: _Schema.HtmlRules });
var serializeHtml = exports.serializeHtml = function serializeHtml(state) {
    return serializer.serialize(state, { render: false }).map(function (el) {
        return _server2.default.renderToStaticMarkup(el);
    }).join('\n');
};
var deserializeHtml = exports.deserializeHtml = function deserializeHtml(html) {
    return serializer.deserialize(html);
};
var getDemoState = exports.getDemoState = function getDemoState() {
    return _slate.Raw.deserialize(_DemoState2.default, { terse: true });
};

var DEFAULT_NODE = 'paragraph';

var plugins = [];

if (process.env.BROWSER) {
    //import InsertImages from 'slate-drop-or-paste-images'
    var InsertImages = require('slate-drop-or-paste-images').default;

    plugins.push(InsertImages({
        extensions: ['jpeg', 'png', 'gif'],
        applyTransform: function applyTransform(transform, file) {
            return transform.insertInline({
                type: 'image',
                isVoid: true,
                data: { file: file }
            });
        }
    }));

    plugins.push((0, _slateInsertBlockOnEnter2.default)({
        kind: 'block',
        type: DEFAULT_NODE,
        nodes: [{ kind: 'text', text: '', ranges: [] }]
    }));
    plugins.push((0, _slateTrailingBlock2.default)({ type: DEFAULT_NODE }));
}

var SlateEditor = (_temp = _class = function (_React$Component) {
    (0, _inherits3.default)(SlateEditor, _React$Component);

    function SlateEditor(props) {
        (0, _classCallCheck3.default)(this, SlateEditor);

        var _this = (0, _possibleConstructorReturn3.default)(this, (SlateEditor.__proto__ || (0, _getPrototypeOf2.default)(SlateEditor)).call(this, props));

        _initialiseProps.call(_this);

        _this.state = { state: props.initialState };
        return _this;
    }

    // When the portal opens, cache the menu element.


    // When the portal opens, cache the menu element.


    // Check if the current selection has a mark with `type` in it.


    // Check if the current selection has a block with `type` in it.


    // Check if the current selection has an inline of `type`.


    // When a mark button is clicked, toggle the current mark.


    // Toggle block type


    // Markdown-style quick formatting


    // If space was entered, check if it was a markdown sequence


    // On backspace, if at the start of a non-paragraph, convert it back into a paragraph node.


    // move sidebar to float left of current blank paragraph


    // move menu to center above current selection


    return SlateEditor;
}(_react2.default.Component), _initialiseProps = function _initialiseProps() {
    var _this2 = this;

    this.reset = function () {
        _this2.setState({ state: _this2.props.initialState });
    };

    this._focus = function () {
        _this2.refs.editor.focus();
    };

    this.componentDidMount = function () {
        _this2.updateMenu();
        _this2.updateSidebar();
    };

    this.componentDidUpdate = function () {
        _this2.updateMenu();
        _this2.updateSidebar();
    };

    this.onChange = function (state) {
        //this.setState({ state })
        _this2.props.onChange(state);
    };

    this.onMenuOpen = function (portal) {
        _this2.setState({ menu: portal.firstChild });
    };

    this.onSidebarOpen = function (portal) {
        _this2.setState({ sidebar: portal.firstChild });
    };

    this.hasMark = function (type) {
        var state = _this2.state.state;

        if (!state.isExpanded) return;
        return state.marks.some(function (mark) {
            return mark.type == type;
        });
    };

    this.hasBlock = function (type) {
        var state = _this2.state.state;
        var document = state.document;

        return state.blocks.some(function (node) {
            return node.type == type || !!document.getClosest(node.key, function (parent) {
                return parent.type == type;
            });
        });
    };

    this.hasInline = function (type) {
        var state = _this2.state.state;

        return state.inlines.some(function (inline) {
            return inline.type == type;
        });
    };

    this.onClickMark = function (e, type) {
        e.preventDefault();
        var state = _this2.state.state;


        state = state.transform().toggleMark(type).apply();

        _this2.setState({ state: state });
    };

    this.onClickBlock = function (e, type) {
        e.preventDefault();
        var state = _this2.state.state;

        var transform = state.transform();
        var _state = state,
            document = _state.document;

        // Handle everything but list buttons.

        if (type != 'bulleted-list' && type != 'numbered-list') {
            var isActive = _this2.hasBlock(type);
            var isList = _this2.hasBlock('list-item');

            if (isList) {
                transform = transform.setBlock(isActive ? DEFAULT_NODE : type).unwrapBlock('bulleted-list').unwrapBlock('numbered-list');
            } else {
                transform = transform.setBlock(isActive ? DEFAULT_NODE : type);
            }
        } else {
            // Handle the extra wrapping required for list buttons.
            var _isList = _this2.hasBlock('list-item');
            var isType = state.blocks.some(function (block) {
                return !!document.getClosest(block, function (parent) {
                    return parent.type == type;
                });
            });

            if (_isList && isType) {
                transform = transform.setBlock(DEFAULT_NODE).unwrapBlock('bulleted-list').unwrapBlock('numbered-list');
            } else if (_isList) {
                transform = transform.unwrapBlock(type == 'bulleted-list' ? 'numbered-list' : 'bulleted-list').wrapBlock(type);
            } else {
                transform = transform.setBlock('list-item').wrapBlock(type);
            }
        }

        state = transform.apply();
        _this2.setState({ state: state });
    };

    this.onClickLink = function (e) {
        e.preventDefault();
        var state = _this2.state.state;

        var hasLinks = _this2.hasInline('link');

        if (hasLinks) {
            state = state.transform().unwrapInline('link').apply();
        } else if (state.isExpanded) {
            var href = window.prompt('Enter the URL of the link:', 'http://steemit.com');
            if (href) {
                state = state.transform().wrapInline({
                    type: 'link',
                    data: { href: href }
                }).collapseToEnd().apply();
            }
        } else {
            var _href = window.prompt('Enter the URL of the link:');
            var text = window.prompt('Enter the text for the link:');
            state = state.transform().insertText(text).extendBackward(text.length).wrapInline({
                type: 'link',
                data: { href: _href }
            }).collapseToEnd().apply();
        }
        _this2.setState({ state: state });
    };

    this.onKeyDown = function (e, data, state) {
        if (data.isMod) return _this2.onModKeyDown(e, data, state);
        switch (data.key) {
            case 'space':
                return _this2.onSpace(e, state);
            case 'backspace':
                return _this2.onBackspace(e, state);
            case 'enter':
                return data.isShift ? _this2.onShiftEnter(e, state) : _this2.onEnter(e, state);
        }
    };

    this.onModKeyDown = function (e, data, state) {
        var mark = void 0;
        switch (data.key) {
            case 'b':
                mark = 'bold';
                break;
            case 'i':
                mark = 'italic';
                break;
            case 'u':
                mark = 'underline';
                break;
            case 'k':
                return _this2.onClickLink(e);
        }

        if (!mark) return;

        state = state.transform().toggleMark(mark).apply();

        e.preventDefault();
        return state;
    };

    this.onSpace = function (e, state) {
        if (state.isExpanded) return;
        var _state2 = state,
            selection = _state2.selection;
        var _state3 = state,
            startText = _state3.startText,
            startBlock = _state3.startBlock,
            startOffset = _state3.startOffset;

        var chars = startBlock.text.slice(0, startOffset); //.replace(/\s*/g, '')
        var type = (0, _Schema.getMarkdownType)(chars);

        if (!type) return;
        if (type == 'list-item' && startBlock.type == 'list-item') return;
        e.preventDefault();

        var transform = state.transform().setBlock(type);

        if (type == 'list-item' && chars != '1.') transform = transform.wrapBlock('bulleted-list');
        if (type == 'list-item' && chars == '1.') transform = transform.wrapBlock('numbered-list');

        state = transform.extendToStartOf(startBlock).delete().apply();

        return state;
    };

    this.onBackspace = function (e, state) {
        if (state.isExpanded) return;
        if (state.startOffset != 0) return;
        var _state4 = state,
            startBlock = _state4.startBlock;


        if (startBlock.type == 'paragraph') return;
        e.preventDefault();

        var transform = state.transform().setBlock('paragraph');

        if (startBlock.type == 'list-item') transform = transform.unwrapBlock('bulleted-list').unwrapBlock('numbered-list');

        state = transform.apply();
        return state;
    };

    this.onShiftEnter = function (e, state) {
        if (state.isExpanded) return;
        var startBlock = state.startBlock,
            startOffset = state.startOffset,
            endOffset = state.endOffset;

        // Allow soft returns for certain block types

        if (startBlock.type == 'paragraph' || startBlock.type == 'code-block' || startBlock.type == 'block-quote') {
            var transform = state.transform();
            if (state.isExpanded) transform = transform.delete();
            transform = transform.insertText('\n');
            return transform.apply();
        }
    };

    this.onEnter = function (e, state) {
        if (state.isExpanded) return;
        var startBlock = state.startBlock,
            startOffset = state.startOffset,
            endOffset = state.endOffset;

        // On return, if at the end of a node type that should not be extended, create a new paragraph below it.

        if (startOffset == 0 && startBlock.length == 0) return _this2.onBackspace(e, state); //empty block
        if (endOffset != startBlock.length) return; //not at end of block

        if (startBlock.type != 'heading-one' && startBlock.type != 'heading-two' && startBlock.type != 'heading-three' && startBlock.type != 'heading-four' && startBlock.type != 'block-quote' && startBlock.type != 'code-block') return;

        e.preventDefault();
        return state.transform().splitBlock().setBlock('paragraph').apply();
    };

    this.onPaste = function (e, data, state) {
        console.log('** onPaste:', data.type, data.html);
        if (data.type != 'html') return;

        var _serializer$deseriali = serializer.deserialize(data.html),
            document = _serializer$deseriali.document;

        return state.transform().insertFragment(document).apply();
    };

    this.renderSidebar = function () {
        var state = _this2.state.state;

        var isOpen = state.isExpanded && state.isFocused;
        return _react2.default.createElement(
            _reactPortal2.default,
            { isOpened: true, onOpen: _this2.onSidebarOpen },
            _react2.default.createElement(
                'div',
                { className: 'SlateEditor__sidebar' },
                _this2.renderAddBlockButton({
                    type: 'image',
                    label: _react2.default.createElement(_Icon2.default, { name: 'photo' }),
                    handler: _this2.onClickInsertImage
                }),
                _this2.renderAddBlockButton({
                    type: 'video',
                    label: _react2.default.createElement(_Icon2.default, { name: 'video' }),
                    handler: _this2.onClickInsertVideo
                }),
                _this2.renderAddBlockButton({
                    type: 'hrule',
                    label: _react2.default.createElement(_Icon2.default, { name: 'line' }),
                    handler: _this2.onClickInsertHr
                })
            )
        );
    };

    this.onClickInsertImage = function (e) {
        e.preventDefault();
        var state = _this2.state.state;


        var src = window.prompt('Enter the URL of the image:', '');
        if (!src) return;

        state = state.transform().insertInline({ type: 'image', isVoid: true, data: { src: src } })
        //.insertBlock({type: 'paragraph', isVoid: false, nodes: [Slate.Text.create()]})
        .focus().collapseToEndOfNextBlock().apply();

        _this2.setState({ state: state });
    };

    this.onClickInsertVideo = function (e, type) {
        e.preventDefault();
        var state = _this2.state.state;


        state = state.transform().insertBlock({ type: 'embed', isVoid: true, data: { src: '' } })
        //.insertBlock({type: 'paragraph', isVoid: false})
        .apply();

        _this2.setState({ state: state });
    };

    this.onClickInsertHr = function (e, type) {
        e.preventDefault();
        var state = _this2.state.state;


        state = state.transform().insertBlock({ type: 'hr', isVoid: true }).insertBlock({ type: 'paragraph', isVoid: false }).apply();

        _this2.setState({ state: state });
    };

    this.renderAddBlockButton = function (props) {
        var type = props.type,
            label = props.label,
            handler = props.handler;

        var onMouseDown = function onMouseDown(e) {
            return handler(e);
        };

        return _react2.default.createElement(
            'span',
            {
                key: type,
                className: 'SlateEditor__sidebar-button',
                onMouseDown: onMouseDown
            },
            label
        );
    };

    this.renderMenu = function () {
        var state = _this2.state.state;

        var isOpen = state.isExpanded && state.isFocused;

        return _react2.default.createElement(
            _reactPortal2.default,
            { isOpened: true, onOpen: _this2.onMenuOpen },
            _react2.default.createElement(
                'div',
                { className: 'SlateEditor__menu SlateEditor__menu' },
                _Schema.schema.toolbarMarks.map(_this2.renderMarkButton),
                _this2.renderInlineButton({
                    type: 'link',
                    label: _react2.default.createElement(_Icon2.default, { name: 'link' })
                }),
                _this2.renderBlockButton({
                    type: 'block-quote',
                    label: _react2.default.createElement(
                        'span',
                        null,
                        '\u201C'
                    )
                }),
                _this2.renderBlockButton({
                    type: 'heading-one',
                    label: 'H1'
                }),
                _this2.renderBlockButton({
                    type: 'heading-two',
                    label: 'H2'
                }),
                _this2.renderBlockButton({
                    type: 'code-block',
                    label: '<>'
                })
            )
        );
    };

    this.renderMarkButton = function (props) {
        var type = props.type,
            label = props.label;

        var isActive = _this2.hasMark(type);
        var onMouseDown = function onMouseDown(e) {
            return _this2.onClickMark(e, type);
        };

        return _react2.default.createElement(
            'span',
            {
                key: type,
                className: 'SlateEditor__menu-button SlateEditor__menu-button-' + type,
                onMouseDown: onMouseDown,
                'data-active': isActive
            },
            _react2.default.createElement(
                'span',
                null,
                label
            )
        );
    };

    this.renderBlockButton = function (props) {
        var type = props.type,
            label = props.label;

        var isActive = _this2.hasBlock(type);
        var onMouseDown = function onMouseDown(e) {
            return _this2.onClickBlock(e, type);
        };

        return _react2.default.createElement(
            'span',
            {
                key: type,
                className: 'SlateEditor__menu-button SlateEditor__menu-button-' + type,
                onMouseDown: onMouseDown,
                'data-active': isActive
            },
            _react2.default.createElement(
                'span',
                null,
                label
            )
        );
    };

    this.renderInlineButton = function (props) {
        var type = props.type,
            label = props.label;

        var isActive = _this2.hasInline(type);
        var onMouseDown = function onMouseDown(e) {
            return _this2.onClickLink(e, type);
        };

        return _react2.default.createElement(
            'span',
            {
                key: type,
                className: 'SlateEditor__menu-button SlateEditor__menu-button-' + type,
                onMouseDown: onMouseDown,
                'data-active': isActive
            },
            _react2.default.createElement(
                'span',
                null,
                label
            )
        );
    };

    this.renderEditor = function () {
        return _react2.default.createElement(
            'div',
            { className: 'SlateEditor Markdown' },
            _react2.default.createElement(_slate.Editor, {
                ref: 'editor',
                schema: _Schema.schema,
                placeholder: _this2.props.placeholder || 'Enter some text...',
                plugins: plugins,
                state: _this2.state.state,
                onChange: _this2.onChange,
                onKeyDown: _this2.onKeyDown,
                onPaste: _this2.onPaste
            })
        );
    };

    this.updateSidebar = function () {
        var _state5 = _this2.state,
            sidebar = _state5.sidebar,
            state = _state5.state;

        if (!sidebar) return;

        var rect = (0, _Helpers.getCollapsedClientRect)();
        if (state.isBlurred || state.isExpanded || !rect) {
            sidebar.removeAttribute('style');
            return;
        }

        sidebar.style.top = rect.top + window.scrollY + 'px';
        sidebar.style.left = rect.left + window.scrollX - sidebar.offsetWidth + 'px';
    };

    this.updateMenu = function () {
        var _state6 = _this2.state,
            menu = _state6.menu,
            state = _state6.state;

        if (!menu) return;

        if (state.isBlurred || state.isCollapsed) {
            menu.removeAttribute('style');
            return;
        }

        var rect = (0, _selectionPosition2.default)();
        menu.style.top = rect.top + window.scrollY - menu.offsetHeight + 'px';
        menu.style.left = rect.left + window.scrollX - menu.offsetWidth / 2 + rect.width / 2 + 'px';
    };

    this.render = function () {
        var state = _this2.state.state;

        return _react2.default.createElement(
            'div',
            null,
            _this2.renderMenu(),
            _this2.renderSidebar(),
            _this2.renderEditor()
        );
    };
}, _temp);
exports.default = SlateEditor;