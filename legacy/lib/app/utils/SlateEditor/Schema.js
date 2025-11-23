'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getMarkdownType = exports.HtmlRules = exports.schema = undefined;

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _Link = require('app/utils/SlateEditor/Link');

var _Link2 = _interopRequireDefault(_Link);

var _Image = require('app/utils/SlateEditor/Image');

var _Image2 = _interopRequireDefault(_Image);

var _Iframe = require('app/utils/SlateEditor/Iframe');

var _Iframe2 = _interopRequireDefault(_Iframe);

var _HRule = require('app/utils/SlateEditor/HRule');

var _HRule2 = _interopRequireDefault(_HRule);

var _Align = require('app/utils/SlateEditor/Align');

var _Align2 = _interopRequireDefault(_Align);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var $ = require('cheerio');

/**
 * Slate editor/toolbar schema, defaults
 */
var schema = exports.schema = {
    defaultNode: 'paragraph',
    toolbarMarks: [{ type: 'bold', label: _react2.default.createElement(
            'strong',
            null,
            'B'
        ) }, { type: 'italic', label: _react2.default.createElement(
            'i',
            null,
            'i'
        ) },
    //{ type: 'underline', label: <u>U</u> },
    //{ type: 'strike',    label: <del>S</del> },
    { type: 'code', label: _react2.default.createElement(
            'code',
            null,
            '{}'
        ) }, {
        type: 'sup',
        label: _react2.default.createElement(
            'span',
            null,
            'x',
            _react2.default.createElement(
                'sup',
                null,
                '2'
            )
        )
    }, {
        type: 'sub',
        label: _react2.default.createElement(
            'span',
            null,
            'x',
            _react2.default.createElement(
                'sub',
                null,
                '2'
            )
        )
    }],

    // blockTypes: {...Blocks,},
    // toolbarTypes: [],
    // sidebarTypes: [],

    nodes: {
        paragraph: function paragraph(_ref) {
            var children = _ref.children,
                attributes = _ref.attributes;
            return _react2.default.createElement(
                'p',
                attributes,
                children
            );
        },
        'code-block': function codeBlock(_ref2) {
            var children = _ref2.children,
                attributes = _ref2.attributes;
            return _react2.default.createElement(
                'pre',
                attributes,
                _react2.default.createElement(
                    'code',
                    null,
                    children
                )
            );
        },
        'block-quote': function blockQuote(_ref3) {
            var children = _ref3.children,
                attributes = _ref3.attributes;
            return _react2.default.createElement(
                'blockquote',
                attributes,
                children
            );
        },
        'bulleted-list': function bulletedList(_ref4) {
            var children = _ref4.children,
                attributes = _ref4.attributes;
            return _react2.default.createElement(
                'ul',
                attributes,
                children
            );
        },
        'numbered-list': function numberedList(_ref5) {
            var children = _ref5.children,
                attributes = _ref5.attributes;
            return _react2.default.createElement(
                'ol',
                attributes,
                children
            );
        },
        'heading-one': function headingOne(_ref6) {
            var children = _ref6.children,
                attributes = _ref6.attributes;
            return _react2.default.createElement(
                'h1',
                attributes,
                children
            );
        },
        'heading-two': function headingTwo(_ref7) {
            var children = _ref7.children,
                attributes = _ref7.attributes;
            return _react2.default.createElement(
                'h2',
                attributes,
                children
            );
        },
        'heading-three': function headingThree(_ref8) {
            var children = _ref8.children,
                attributes = _ref8.attributes;
            return _react2.default.createElement(
                'h3',
                attributes,
                children
            );
        },
        'heading-four': function headingFour(_ref9) {
            var children = _ref9.children,
                attributes = _ref9.attributes;
            return _react2.default.createElement(
                'h4',
                attributes,
                children
            );
        },
        'list-item': function listItem(_ref10) {
            var children = _ref10.children,
                attributes = _ref10.attributes;
            return _react2.default.createElement(
                'li',
                attributes,
                children
            );
        },
        table: function table(_ref11) {
            var children = _ref11.children,
                attributes = _ref11.attributes;
            return _react2.default.createElement(
                'table',
                attributes,
                children
            );
        },
        thead: function thead(_ref12) {
            var children = _ref12.children,
                attributes = _ref12.attributes;
            return _react2.default.createElement(
                'thead',
                attributes,
                children
            );
        },
        tbody: function tbody(_ref13) {
            var children = _ref13.children,
                attributes = _ref13.attributes;
            return _react2.default.createElement(
                'tbody',
                attributes,
                children
            );
        },
        tr: function tr(_ref14) {
            var children = _ref14.children,
                attributes = _ref14.attributes;
            return _react2.default.createElement(
                'tr',
                attributes,
                children
            );
        },
        td: function td(_ref15) {
            var children = _ref15.children,
                attributes = _ref15.attributes;
            return _react2.default.createElement(
                'td',
                attributes,
                children
            );
        },
        th: function th(_ref16) {
            var children = _ref16.children,
                attributes = _ref16.attributes;
            return _react2.default.createElement(
                'th',
                attributes,
                children
            );
        },
        hr: _HRule2.default,
        image: _Image2.default,
        link: _Link2.default,
        embed: _Iframe2.default,
        align: _Align2.default
    },

    marks: {
        bold: function bold(props) {
            return _react2.default.createElement(
                'strong',
                null,
                props.children
            );
        },
        code: function code(props) {
            return _react2.default.createElement(
                'code',
                null,
                props.children
            );
        },
        italic: function italic(props) {
            return _react2.default.createElement(
                'em',
                null,
                props.children
            );
        },
        underline: function underline(props) {
            return _react2.default.createElement(
                'u',
                null,
                props.children
            );
        },
        strike: function strike(props) {
            return _react2.default.createElement(
                'del',
                null,
                props.children
            );
        },
        sub: function sub(props) {
            return _react2.default.createElement(
                'sub',
                null,
                props.children
            );
        },
        sup: function sup(props) {
            return _react2.default.createElement(
                'sup',
                null,
                props.children
            );
        }
    }
};

/**
 * Rules for de/serializing editor state to and from HTML
 */

// Map html --> block type
var BLOCK_TAGS = {
    p: 'paragraph',
    blockquote: 'block-quote',
    pre: 'code-block',
    h1: 'heading-one',
    h2: 'heading-two',
    h3: 'heading-three',
    h4: 'heading-four',
    ul: 'bulleted-list',
    ol: 'numbered-list',
    li: 'list-item',
    hr: 'hr',
    table: 'table',
    thead: 'thead',
    tbody: 'tbody',
    tr: 'tr',
    td: 'td',
    th: 'th'
};

// Map HTML --> mark type
var MARK_TAGS = {
    em: 'italic',
    i: 'italic',
    strong: 'bold',
    b: 'bold',
    u: 'underline',
    del: 'strike',
    strike: 'strike',
    sup: 'sup',
    sub: 'sub'
};

var validAligns = ['pull-right', 'pull-left', 'text-justify', 'text-rtl', 'text-center', 'text-right'];

/**
 * Rules for converting from and to HTML. The first rules are highest priority,
 * with unmatched cases (i.e. null return) falling through to those below.
 */
var HtmlRules = exports.HtmlRules = [
// Catch-all debug wrapper
{
    //deserialize: (el, next) => console.log("** deserialize: ", $.html(el).replace(/\n/g, "\\n")),
    //serialize: (object, children) => console.log("** serialize:", object.type, object.kind, 'data:', JSON.stringify(object.data))
},

// Alignment wrapper
{
    deserialize: function deserialize(el, next) {
        if (el.tagName == 'center') {
            return {
                kind: 'block',
                type: 'align',
                data: { align: 'text-center' },
                nodes: next(el.children)
            };
        }
        if (el.tagName == 'div') {
            var align = el.attribs.class;
            if (!validAligns.includes(align)) return;
            return {
                kind: 'block',
                type: 'align',
                data: { align: align },
                nodes: next(el.children)
            };
        }
    },
    serialize: function serialize(object, children) {
        if (object.kind == 'block' && object.type == 'align') {
            var align = object.data.get('align');
            return _react2.default.createElement(
                'div',
                { className: align },
                children
            );
        }
    }
},

// Block rules
{
    deserialize: function deserialize(el, next) {
        var type = BLOCK_TAGS[el.tagName];
        if (!type) return;

        // Special case for <pre>: ignore its inner <code> element.
        var code = el.tagName == 'pre' ? el.children[0] : null;
        var children = code && code.tagName == 'code' ? code.children : el.children;

        // due to disabled/broken whitespace normalization in cheerio/htmlparser2, perform basic cleaning...
        //   i.e. removal of text nodes where they are invalid -- otherwise they may convert to <br />s in bad places
        var noTextChildren = 'ol,ul,table,thead,tbody,tr'.split(',');
        if (noTextChildren.includes(el.tagName)) {
            children = children.filter(function (el) {
                return el.type !== 'text';
            });
        }

        // If this block-level node contains *any* <center> tags, strip them out and wrap-align node
        var center = false;
        children = children.reduce(function (out, child) {
            if (child.tagName == 'center') {
                center = true;
                //child.children.map(c => out.push(c))
                out.push.apply(out, (0, _toConsumableArray3.default)(child.children));
            } else {
                out.push(child);
            }
            return out;
        }, []);

        // Generate output block with clean children
        var block = {
            kind: 'block',
            type: type,
            isVoid: type == 'hr',
            nodes: next(children)
        };

        // Wrap output block with align node if needed
        if (center) {
            console.log('** force-centering node');
            return {
                kind: 'block',
                type: 'align',
                data: { align: 'text-center' },
                nodes: [block]
            };
        }

        // Otherwise return plain block
        return block;
    },

    serialize: function serialize(object, children) {
        if (object.kind !== 'block') return;
        switch (object.type) {
            case 'paragraph':
                return _react2.default.createElement(
                    'p',
                    null,
                    children
                );
            case 'block-quote':
                return _react2.default.createElement(
                    'blockquote',
                    null,
                    children
                );
            case 'code-block':
                return _react2.default.createElement(
                    'pre',
                    null,
                    _react2.default.createElement(
                        'code',
                        null,
                        children
                    )
                );
            case 'heading-one':
                return _react2.default.createElement(
                    'h1',
                    null,
                    children
                );
            case 'heading-two':
                return _react2.default.createElement(
                    'h2',
                    null,
                    children
                );
            case 'heading-three':
                return _react2.default.createElement(
                    'h3',
                    null,
                    children
                );
            case 'heading-four':
                return _react2.default.createElement(
                    'h4',
                    null,
                    children
                );
            case 'bulleted-list':
                return _react2.default.createElement(
                    'ul',
                    null,
                    children
                );
            case 'numbered-list':
                return _react2.default.createElement(
                    'ol',
                    null,
                    children
                );
            case 'list-item':
                return _react2.default.createElement(
                    'li',
                    null,
                    children
                );
            case 'hr':
                return _react2.default.createElement('hr', null);
            case 'table':
                return _react2.default.createElement(
                    'table',
                    null,
                    children
                );
            case 'thead':
                return _react2.default.createElement(
                    'thead',
                    null,
                    children
                );
            case 'tbody':
                return _react2.default.createElement(
                    'tbody',
                    null,
                    children
                );
            case 'tr':
                return _react2.default.createElement(
                    'tr',
                    null,
                    children
                );
            case 'td':
                return _react2.default.createElement(
                    'td',
                    null,
                    children
                );
            case 'th':
                return _react2.default.createElement(
                    'th',
                    null,
                    children
                );
        }
    }
},

// Mark rules
{
    deserialize: function deserialize(el, next) {
        var type = MARK_TAGS[el.tagName];
        if (!type) return;
        return {
            kind: 'mark',
            type: type,
            nodes: next(el.children)
        };
    },
    serialize: function serialize(object, children) {
        if (object.kind !== 'mark') return;
        switch (object.type) {
            case 'bold':
                return _react2.default.createElement(
                    'strong',
                    null,
                    children
                );
            case 'italic':
                return _react2.default.createElement(
                    'em',
                    null,
                    children
                );
            case 'underline':
                return _react2.default.createElement(
                    'u',
                    null,
                    children
                );
            case 'strike':
                return _react2.default.createElement(
                    'del',
                    null,
                    children
                );
            case 'code':
                return _react2.default.createElement(
                    'code',
                    null,
                    children
                );
            case 'sup':
                return _react2.default.createElement(
                    'sup',
                    null,
                    children
                );
            case 'sub':
                return _react2.default.createElement(
                    'sub',
                    null,
                    children
                );
        }
    }
},

// Custom
{
    deserialize: function deserialize(el, next) {
        switch (el.tagName) {
            case 'iframe':
                return {
                    kind: 'block',
                    type: 'embed',
                    isVoid: true,
                    data: { src: el.attribs.src },
                    nodes: next(el.children)
                };
            case 'img':
                return {
                    kind: 'inline',
                    type: 'image',
                    isVoid: true,
                    data: {
                        src: el.attribs.src,
                        alt: el.attribs.alt
                    },
                    nodes: next(el.children)
                };
            case 'a':
                return {
                    kind: 'inline',
                    type: 'link',
                    data: { href: el.attribs.href },
                    nodes: next(el.children)
                };
            case 'br':
                return {
                    kind: 'text',
                    ranges: [{ text: '\n' }]
                };
            case 'code':
                // may not be necessary after pr #406
                if ($(el).closest('pre').length == 0) {
                    return {
                        kind: 'mark',
                        type: 'code',
                        nodes: next(el.children)
                    };
                } else {
                    console.log('** skipping <code> within a <pre>');
                }
        }
    },

    serialize: function serialize(object, children) {
        if (object.kind == 'string') return;
        if (object.kind == 'inline' && object.type == 'link') {
            var href = object.data.get('href');
            return _react2.default.createElement(
                'a',
                { href: href },
                children
            );
        }
        if (object.kind == 'block' && object.type == 'embed') {
            var src = object.data.get('src');
            return _react2.default.createElement('iframe', { src: src });
        }
        if (object.kind == 'inline' && object.type == 'image') {
            var _src = object.data.get('src');
            var alt = object.data.get('alt');
            if (!_src) console.log('** ERR: serializing image with no src...', (0, _stringify2.default)(object));
            return _react2.default.createElement('img', { src: _src, alt: alt });
        }
    }
},

// debug uncaught nodes/elements
{
    deserialize: function deserialize(el, next) {
        if (el.type !== 'text') console.log('** no deserializer for: ', $.html(el).replace(/\n/g, '\\n'));
    },
    serialize: function serialize(object, children) {
        if (object.kind != 'string') console.log('** no serializer for:', object.type, object.kind, 'data:', (0, _stringify2.default)(object));
    }
}];

var getMarkdownType = exports.getMarkdownType = function getMarkdownType(chars) {
    switch (chars) {
        case '1.':
        case '*':
        case '-':
            return 'list-item';
        case '>':
            return 'block-quote';
        case '#':
            return 'heading-one';
        case '##':
            return 'heading-two';
        case '###':
            return 'heading-three';
        case '####':
            return 'heading-four';
        case '   ':
            return 'code-block';
        case '---':
            return 'hr';
        default:
            return null;
    }
};