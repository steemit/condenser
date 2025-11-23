import React from 'react';
import Link from 'app/utils/SlateEditor/Link';
import Image from 'app/utils/SlateEditor/Image';
import Iframe from 'app/utils/SlateEditor/Iframe';
import HRule from 'app/utils/SlateEditor/HRule';
import Align from 'app/utils/SlateEditor/Align';

const $ = require('cheerio');

/**
 * Slate editor/toolbar schema, defaults
 */
export const schema = {
    defaultNode: 'paragraph',
    toolbarMarks: [
        { type: 'bold', label: <strong>B</strong> },
        { type: 'italic', label: <i>i</i> },
        //{ type: 'underline', label: <u>U</u> },
        //{ type: 'strike',    label: <del>S</del> },
        { type: 'code', label: <code>{'{}'}</code> },
        {
            type: 'sup',
            label: (
                <span>
                    x<sup>2</sup>
                </span>
            ),
        },
        {
            type: 'sub',
            label: (
                <span>
                    x<sub>2</sub>
                </span>
            ),
        },
    ],

    // blockTypes: {...Blocks,},
    // toolbarTypes: [],
    // sidebarTypes: [],

    nodes: {
        paragraph: ({ children, attributes }) => (
            <p {...attributes}>{children}</p>
        ),
        'code-block': ({ children, attributes }) => (
            <pre {...attributes}>
                <code>{children}</code>
            </pre>
        ),
        'block-quote': ({ children, attributes }) => (
            <blockquote {...attributes}>{children}</blockquote>
        ),
        'bulleted-list': ({ children, attributes }) => (
            <ul {...attributes}>{children}</ul>
        ),
        'numbered-list': ({ children, attributes }) => (
            <ol {...attributes}>{children}</ol>
        ),
        'heading-one': ({ children, attributes }) => (
            <h1 {...attributes}>{children}</h1>
        ),
        'heading-two': ({ children, attributes }) => (
            <h2 {...attributes}>{children}</h2>
        ),
        'heading-three': ({ children, attributes }) => (
            <h3 {...attributes}>{children}</h3>
        ),
        'heading-four': ({ children, attributes }) => (
            <h4 {...attributes}>{children}</h4>
        ),
        'list-item': ({ children, attributes }) => (
            <li {...attributes}>{children}</li>
        ),
        table: ({ children, attributes }) => (
            <table {...attributes}>{children}</table>
        ),
        thead: ({ children, attributes }) => (
            <thead {...attributes}>{children}</thead>
        ),
        tbody: ({ children, attributes }) => (
            <tbody {...attributes}>{children}</tbody>
        ),
        tr: ({ children, attributes }) => <tr {...attributes}>{children}</tr>,
        td: ({ children, attributes }) => <td {...attributes}>{children}</td>,
        th: ({ children, attributes }) => <th {...attributes}>{children}</th>,
        hr: HRule,
        image: Image,
        link: Link,
        embed: Iframe,
        align: Align,
    },

    marks: {
        bold: props => <strong>{props.children}</strong>,
        code: props => <code>{props.children}</code>,
        italic: props => <em>{props.children}</em>,
        underline: props => <u>{props.children}</u>,
        strike: props => <del>{props.children}</del>,
        sub: props => <sub>{props.children}</sub>,
        sup: props => <sup>{props.children}</sup>,
    },
};

/**
 * Rules for de/serializing editor state to and from HTML
 */

// Map html --> block type
const BLOCK_TAGS = {
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
    th: 'th',
};

// Map HTML --> mark type
const MARK_TAGS = {
    em: 'italic',
    i: 'italic',
    strong: 'bold',
    b: 'bold',
    u: 'underline',
    del: 'strike',
    strike: 'strike',
    sup: 'sup',
    sub: 'sub',
};

const validAligns = [
    'pull-right',
    'pull-left',
    'text-justify',
    'text-rtl',
    'text-center',
    'text-right',
];

/**
 * Rules for converting from and to HTML. The first rules are highest priority,
 * with unmatched cases (i.e. null return) falling through to those below.
 */
export const HtmlRules = [
    // Catch-all debug wrapper
    {
        //deserialize: (el, next) => console.log("** deserialize: ", $.html(el).replace(/\n/g, "\\n")),
        //serialize: (object, children) => console.log("** serialize:", object.type, object.kind, 'data:', JSON.stringify(object.data))
    },

    // Alignment wrapper
    {
        deserialize: (el, next) => {
            if (el.tagName == 'center') {
                return {
                    kind: 'block',
                    type: 'align',
                    data: { align: 'text-center' },
                    nodes: next(el.children),
                };
            }
            if (el.tagName == 'div') {
                const align = el.attribs.class;
                if (!validAligns.includes(align)) return;
                return {
                    kind: 'block',
                    type: 'align',
                    data: { align },
                    nodes: next(el.children),
                };
            }
        },
        serialize: (object, children) => {
            if (object.kind == 'block' && object.type == 'align') {
                const align = object.data.get('align');
                return <div className={align}>{children}</div>;
            }
        },
    },

    // Block rules
    {
        deserialize: (el, next) => {
            const type = BLOCK_TAGS[el.tagName];
            if (!type) return;

            // Special case for <pre>: ignore its inner <code> element.
            const code = el.tagName == 'pre' ? el.children[0] : null;
            let children =
                code && code.tagName == 'code' ? code.children : el.children;

            // due to disabled/broken whitespace normalization in cheerio/htmlparser2, perform basic cleaning...
            //   i.e. removal of text nodes where they are invalid -- otherwise they may convert to <br />s in bad places
            const noTextChildren = 'ol,ul,table,thead,tbody,tr'.split(',');
            if (noTextChildren.includes(el.tagName)) {
                children = children.filter(el => el.type !== 'text');
            }

            // If this block-level node contains *any* <center> tags, strip them out and wrap-align node
            let center = false;
            children = children.reduce((out, child) => {
                if (child.tagName == 'center') {
                    center = true;
                    //child.children.map(c => out.push(c))
                    out.push(...child.children);
                } else {
                    out.push(child);
                }
                return out;
            }, []);

            // Generate output block with clean children
            const block = {
                kind: 'block',
                type: type,
                isVoid: type == 'hr',
                nodes: next(children),
            };

            // Wrap output block with align node if needed
            if (center) {
                console.log('** force-centering node');
                return {
                    kind: 'block',
                    type: 'align',
                    data: { align: 'text-center' },
                    nodes: [block],
                };
            }

            // Otherwise return plain block
            return block;
        },

        serialize: (object, children) => {
            if (object.kind !== 'block') return;
            switch (object.type) {
                case 'paragraph':
                    return <p>{children}</p>;
                case 'block-quote':
                    return <blockquote>{children}</blockquote>;
                case 'code-block':
                    return (
                        <pre>
                            <code>{children}</code>
                        </pre>
                    );
                case 'heading-one':
                    return <h1>{children}</h1>;
                case 'heading-two':
                    return <h2>{children}</h2>;
                case 'heading-three':
                    return <h3>{children}</h3>;
                case 'heading-four':
                    return <h4>{children}</h4>;
                case 'bulleted-list':
                    return <ul>{children}</ul>;
                case 'numbered-list':
                    return <ol>{children}</ol>;
                case 'list-item':
                    return <li>{children}</li>;
                case 'hr':
                    return <hr />;
                case 'table':
                    return <table>{children}</table>;
                case 'thead':
                    return <thead>{children}</thead>;
                case 'tbody':
                    return <tbody>{children}</tbody>;
                case 'tr':
                    return <tr>{children}</tr>;
                case 'td':
                    return <td>{children}</td>;
                case 'th':
                    return <th>{children}</th>;
            }
        },
    },

    // Mark rules
    {
        deserialize: (el, next) => {
            const type = MARK_TAGS[el.tagName];
            if (!type) return;
            return {
                kind: 'mark',
                type: type,
                nodes: next(el.children),
            };
        },
        serialize: (object, children) => {
            if (object.kind !== 'mark') return;
            switch (object.type) {
                case 'bold':
                    return <strong>{children}</strong>;
                case 'italic':
                    return <em>{children}</em>;
                case 'underline':
                    return <u>{children}</u>;
                case 'strike':
                    return <del>{children}</del>;
                case 'code':
                    return <code>{children}</code>;
                case 'sup':
                    return <sup>{children}</sup>;
                case 'sub':
                    return <sub>{children}</sub>;
            }
        },
    },

    // Custom
    {
        deserialize: (el, next) => {
            switch (el.tagName) {
                case 'iframe':
                    return {
                        kind: 'block',
                        type: 'embed',
                        isVoid: true,
                        data: { src: el.attribs.src },
                        nodes: next(el.children),
                    };
                case 'img':
                    return {
                        kind: 'inline',
                        type: 'image',
                        isVoid: true,
                        data: {
                            src: el.attribs.src,
                            alt: el.attribs.alt,
                        },
                        nodes: next(el.children),
                    };
                case 'a':
                    return {
                        kind: 'inline',
                        type: 'link',
                        data: { href: el.attribs.href },
                        nodes: next(el.children),
                    };
                case 'br':
                    return {
                        kind: 'text',
                        ranges: [{ text: '\n' }],
                    };
                case 'code':
                    // may not be necessary after pr #406
                    if ($(el).closest('pre').length == 0) {
                        return {
                            kind: 'mark',
                            type: 'code',
                            nodes: next(el.children),
                        };
                    } else {
                        console.log('** skipping <code> within a <pre>');
                    }
            }
        },

        serialize: (object, children) => {
            if (object.kind == 'string') return;
            if (object.kind == 'inline' && object.type == 'link') {
                const href = object.data.get('href');
                return <a href={href}>{children}</a>;
            }
            if (object.kind == 'block' && object.type == 'embed') {
                const src = object.data.get('src');
                return <iframe src={src} />;
            }
            if (object.kind == 'inline' && object.type == 'image') {
                const src = object.data.get('src');
                const alt = object.data.get('alt');
                if (!src)
                    console.log(
                        '** ERR: serializing image with no src...',
                        JSON.stringify(object)
                    );
                return <img src={src} alt={alt} />;
            }
        },
    },

    // debug uncaught nodes/elements
    {
        deserialize: (el, next) => {
            if (el.type !== 'text')
                console.log(
                    '** no deserializer for: ',
                    $.html(el).replace(/\n/g, '\\n')
                );
        },
        serialize: (object, children) => {
            if (object.kind != 'string')
                console.log(
                    '** no serializer for:',
                    object.type,
                    object.kind,
                    'data:',
                    JSON.stringify(object)
                );
        },
    },
];

export const getMarkdownType = chars => {
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
