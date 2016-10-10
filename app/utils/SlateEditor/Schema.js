import React from 'react'
import Image from 'app/utils/SlateEditor/Image'


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
    li:         'bulleted-list-item',
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
            let type = BLOCK_TAGS[el.tagName]
            if (!type) return
            if(type == 'bulleted-list-item' && el.parent.name == 'ol') type = 'numbered-list-item'
            return {
                kind: 'block',
                type: type,
                nodes: next(el.children)
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
                case 'bulleted-list-item': return <li>{children}</li>
                case 'numbered-list-item': return <li>{children}</li>
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
            if (el.tagName == 'iframe') {
                return {
                    kind: 'block',
                    type: 'paragraph',
                    nodes: next(el.children)
                }
            }
            if (el.tagName == 'hr') {
                return {
                    kind: 'block',
                    type: 'hr',
                    isVoid: true,
                    nodes: next(el.children)
                }
            }
            if (el.tagName == 'img') {
                return {
                    kind: 'block',
                    type: 'image',
                    isVoid: true,
                    data: {src: el.attribs.src},
                    nodes: next(el.children)
                }
            }
            if (el.tagName == 'a') {
                const {href} = el.attribs
                if(!href) console.log("** ERR: deserialized <a> with no href")
                return {
                    kind: 'block',
                    type: 'link',
                    data: {href: href},
                    nodes: next(el.children)
                }
            }
            if (el.tagName == 'br') {
                return {
                    "kind": "text",
                    "ranges": [{"text": "\n"}]
                }
            }
            if (el.tagName == 'code') {
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
            if(object.kind == 'block' && object.type == 'hr') {
                return <hr />
            }
            if(object.kind == 'block' && object.type == 'link') {
                const href = object.data.get('href')
                if(!href) console.log("** ERR: serializing <a> with no href", JSON.stringify(object.data, null, 2))
                return <a href={href}>{children}</a>
            }
            if(object.kind == 'block' && object.type == 'image') {
                const data = object.data
                const src = data.get('src')
                if(!src) {
                  console.log("** ERR: serializing image with no src...")
                  console.log("Serializing image.... data:",   JSON.stringify(data))
                  console.log("Serializing image.... object:", JSON.stringify(object))
                }
                return <img src={src} />
            }
            console.log("No serializer for: ", object.kind, JSON.stringify(object, null, 2), children)
        }
    }
]

export const schema = {
    defaultNode: 'paragraph',
    toolbarMarks: [
        { type: 'bold',      label: <strong>B</strong> },
        { type: 'italic',    label: <i>I</i> },
        { type: 'underline', label: <u>U</u> },
        { type: 'strike',    label: <del>S</del> },
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
        'block':         ({ children }) => <p style={{background: 'red'}}>{children}</p>,
        'paragraph':     ({ children }) => <p>{children}</p>,
        'code-block':    ({ children }) => <pre><code>{children}</code></pre>,
        'block-quote':   ({ children }) => <blockquote>{children}</blockquote>,
        'bulleted-list': ({ children }) => <ul>{children}</ul>,
        'numbered-list': ({ children, attributes }) => <ol {...attributes}>{children}</ol>,
        'heading-one':   ({ children }) => <h1>{children}</h1>,
        'heading-two':   ({ children }) => <h2>{children}</h2>,
        'heading-three': ({ children }) => <h3>{children}</h3>,
        'heading-four':  ({ children }) => <h4>{children}</h4>,
        'bulleted-list-item': ({ children }) => <li>{children}</li>,
        'numbered-list-item': ({ children }) => <li>{children}</li>,
        'hr':                 ({ children }) => <hr />,
        'image': Image,
        'link':  (props) => {
            const { data } = props.node
            const href = data.get('href')
            return <a {...props.attributes} href={href}>{props.children}</a>
        },
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
        case '*':
        case '-':    return 'bulleted-list-item';
        case '>':    return 'block-quote';
        case '#':    return 'heading-one';
        case '##':   return 'heading-two';
        case '###':  return 'heading-three';
        case '####': return 'heading-four';
        case '1.':   return 'numbered-list-item';
        case '    ': return 'code-block';
        case '---':  return 'hr';
        default: return null;
    }
}

