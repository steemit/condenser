import React from 'react'
import Link from 'app/utils/SlateEditor/Link'
import Image from 'app/utils/SlateEditor/Image'
import HRule from 'app/utils/SlateEditor/HRule'


const $ = require('cheerio');

/*

--unsupported
div ['pull-right', 'pull-left', 'text-justify', 'text-rtl'], center
iframe
table, thead, tbody, tr, th, td

*/

// Map html --> block type
const BLOCK_TAGS = {
    p:          'paragraph',
    blockquote: 'block-quote',
    pre:        'code-block',
    h1:         'heading-one',
    h2:         'heading-two',
    h3:         'heading-three',
    h4:         'heading-four',
    ul:         'bulleted-list',
    ol:         'numbered-list',
    li:         'list-item',
    hr:         'hr',
}

// Map HTML --> mark type
const MARK_TAGS = {
    em:     'italic',
    i:      'italic',
    strong: 'bold',
    b:      'bold',
    u:      'underline',
    del:    'strike',
    strike: 'strike',
    sup:    'sup',
    sub:    'sub',
}


export const HtmlRules = [

    // Block rules
    {
        deserialize: (el, next) => {
            const type = BLOCK_TAGS[el.tagName]
            if (!type) return

            // Special case for <pre>: ignore its inner <code> element.
            const code = el.tagName == 'pre' ? el.children[0] : null
            let children = code && code.tagName == 'code' ? code.children : el.children

            // enforce that lists have only <li> children
            if(el.tagName == 'ol' || el.tagName == 'ul') {
                children = children.filter(el => el.tagName == 'li')
            }

            return {
                kind: 'block',
                type: type,
                isVoid: (type == 'hr'),
                nodes: next(children)
            }
        },
        serialize: (object, children) => {
            if(object.kind !== 'block') return
            switch(object.type) {
                case 'paragraph':          return <p>{children}</p>
                case 'block-quote':        return <blockquote>{children}</blockquote>
                case 'code-block':         return <pre><code>{children}</code></pre>
                case 'heading-one':        return <h1>{children}</h1>
                case 'heading-two':        return <h2>{children}</h2>
                case 'heading-three':      return <h3>{children}</h3>
                case 'heading-four':       return <h4>{children}</h4>
                case 'bulleted-list':      return <ul>{children}</ul>
                case 'numbered-list':      return <ol>{children}</ol>
                case 'list-item':          return <li>{children}</li>
                case 'hr':                 return <hr />
            }
        }
    },

    // Mark rules
    {
        deserialize: (el, next) => {
            const type = MARK_TAGS[el.tagName]
            if (!type) return
            return {
                kind: 'mark',
                type: type,
                nodes: next(el.children)
            }
        },
        serialize: (object, children) => {
            if(object.kind !== 'mark') return;
            switch(object.type) {
                case 'bold':      return <strong>{children}</strong>
                case 'italic':    return <i>{children}</i>
                case 'underline': return <u>{children}</u>
                case 'strike':    return <del>{children}</del>
                case 'code':      return <code>{children}</code>
                case 'sup':       return <sup>{children}</sup>
                case 'sub':       return <sub>{children}</sub>
            }
        }
    },

    // Custom
    {
        deserialize: (el, next) => {
            switch(el.tagName) {
                case 'img':
                    return {
                        kind: 'inline',
                        type: 'image',
                        isVoid: true,
                        data: {src: el.attribs.src, alt: el.attribs.al},
                        nodes: next(el.children)
                    }
                case 'a':
                    const {href} = el.attribs
                    if(!href) console.log("** ERR: deserialized <a> with no href")
                    return {
                        kind: 'inline',
                        type: 'link',
                        data: {href: href},
                        nodes: next(el.children)
                    }
                case 'br':
                    return {
                        "kind": "text",
                        "ranges": [{"text": "\n"}]
                    }
                case 'code':
                    if(! $(el).closest('pre')) {
                      return {
                          kind: 'mark',
                          type: 'code',
                          nodes: next(el.children)
                      }
                    } else {
                      console.log("** skipping <code> within a <pre>")
                    }
            }

            if(el.type == 'text') return
            if(BLOCK_TAGS[el.tagName] || MARK_TAGS[el.tagName]) return
            console.log("No deserializer for: ", el.tagName, el)
        },
        serialize: (object, children) => {
            if(object.kind == 'string') return;
            if(object.kind == 'inline' && object.type == 'link') {
                const href = object.data.get('href')
                if(!href) console.log("** ERR: serializing <a> with no href", JSON.stringify(object.data, null, 2))
                return <a href={href}>{children}</a>
            }
            if(object.kind == 'inline' && object.type == 'image') {
                const src = object.data.get('src')
                const alt = object.data.get('alt')
                if(!src) console.log("** ERR: serializing image with no src...", JSON.stringify(object))
                return <img src={src} alt={alt} />
            }
            console.log("No serializer for: ", object.kind, JSON.stringify(object, null, 2), children)
        }
    }
]

export const schema = {
    defaultNode: 'paragraph',
    toolbarMarks: [
        { type: 'bold',      label: <strong>B</strong> },
        { type: 'italic',    label: <i>i</i> },
        //{ type: 'underline', label: <u>U</u> },
        //{ type: 'strike',    label: <del>S</del> },
        { type: 'code',      label: <code>{'{}'}</code> },
        { type: 'sup',       label: <span>x<sup>2</sup></span> },
        { type: 'sub',       label: <span>x<sub>2</sub></span> },
    ],

/*
    blockTypes: {
      ...Blocks,
    },
    toolbarTypes: [
        { type: 'heading-one',   icon: 'header' },
        { type: 'heading-two',   icon: 'header' },
        { type: 'block-quote',   icon: 'quote-left' },
        { type: 'numbered-list', icon: 'list-ol' },
        { type: 'bulleted-list', icon: 'list-ul' },
    ],
    sidebarTypes: [],
*/

    nodes: {
        'paragraph':     ({ children, attributes }) => <p {...attributes}>{children}</p>,
        'code-block':    ({ children, attributes }) => <pre {...attributes}><code>{children}</code></pre>,
        'block-quote':   ({ children, attributes }) => <blockquote {...attributes}>{children}</blockquote>,
        'bulleted-list': ({ children, attributes }) => <ul {...attributes}>{children}</ul>,
        'numbered-list': ({ children, attributes }) => <ol {...attributes}>{children}</ol>,
        'heading-one':   ({ children, attributes }) => <h1 {...attributes}>{children}</h1>,
        'heading-two':   ({ children, attributes }) => <h2 {...attributes}>{children}</h2>,
        'heading-three': ({ children, attributes }) => <h3 {...attributes}>{children}</h3>,
        'heading-four':  ({ children, attributes }) => <h4 {...attributes}>{children}</h4>,
        'list-item':     ({ children, attributes }) => <li {...attributes}>{children}</li>,
        'hr':    HRule,
        'image': Image,
        'link':  Link,
    },

    marks: {
        bold:      props => <strong>{props.children}</strong>,
        code:      props => <code>{props.children}</code>,
        italic:    props => <em>{props.children}</em>,
        underline: props => <u>{props.children}</u>,
        strike:    props => <del>{props.children}</del>,
        sub:       props => <sub>{props.children}</sub>,
        sup:       props => <sup>{props.children}</sup>,
    },
}

export const getMarkdownType = (chars) => {
    switch (chars) {
        case '1.':
        case '*':
        case '-':    return 'list-item';
        case '>':    return 'block-quote';
        case '#':    return 'heading-one';
        case '##':   return 'heading-two';
        case '###':  return 'heading-three';
        case '####': return 'heading-four';
        case '   ':  return 'code-block';
        case '---':  return 'hr';
        default: return null;
    }
}

