import React from 'react'

/*

--deprecate
s, strike?
q
h5, h6

--unsupported
hr
div ['pull-right', 'pull-left', 'text-justify', 'text-rtl']
iframe
br
center
table, thead, tbody, tr, th, td

--inline
a
img

*/

const BLOCK_TAGS = {
    blockquote: 'block-quote',
    p:          'paragraph',
    pre:        'code',
    h1:         'heading-one',
    h2:         'heading-two',
    h3:         'heading-three',
    h4:         'heading-four',
    ul:         'bulleted-list',
    ol:         'numbered-list',
    li:         'bulleted-list-item',
}

const MARK_TAGS = {
    em:     'italic',
    i:      'italic',
    strong: 'bold',
    b:      'bold',
    u:      'underline',
    del:    'strike',
    strike: 'strike',
    code:   'code',
/*
    sup:    'sup',
    sub:    'sub',

*/
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
                case 'code':               return <pre><code>{children}</code></pre>
				case 'paragraph':          return <p>{children}</p>
				case 'block-quote':        return <blockquote>{children}</blockquote>
				case 'bulleted-list':      return <ul>{children}</ul>
				case 'numbered-list':      return <ol>{children}</ol>
				case 'heading-one':        return <h1>{children}</h1>
				case 'heading-two':        return <h2>{children}</h2>
				case 'heading-three':      return <h3>{children}</h3>
				case 'heading-four':       return <h4>{children}</h4>
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
            if (el.tagName == 'img') {
                return {
                    kind: 'block',
                    type: 'image',
                    data: {src: el.attribs.src},
                    nodes: next(el.children)
                }
            }
            if (el.tagName == 'a') {
                console.log("deserialized <a>, the href is", el.attribs.href)
                return {
                    kind: 'block',
                    type: 'link',
                    data: {href: el.attribs.href},
                    nodes: next(el.children)
                }
            }
            if(el.type == 'text') return
            if(BLOCK_TAGS[el.tagName] || MARK_TAGS[el.tagName]) return
			console.log("No deserializer for: ", el.tagName, el)
        },
        serialize: (object, children) => {
            if(object.kind == 'string') return;
            if(object.kind == 'block' && object.type == 'link') {
                console.log("Serialized <a>, the href is", object.data.get('href'), JSON.stringify(object.data, null, 2))
                return <a href={object.data.get('href')}>{children}</a>
            }
            if(object.kind == 'block' && object.type == 'image') {
                const data = object.data
                const src = data.get('src')
                return <img src={src} />
            }
			console.log("No serializer for: ", object.kind, JSON.stringify(object, null, 2), children)
        }
    }
]

export const schema = {
    defaultNode: 'paragraph',
/*
    blockTypes: {
      ...Blocks,
    },
    toolbarMarks: [
        { type: 'bold',      icon: 'bold' },
        { type: 'italic',    icon: 'italic' },
        { type: 'underline', icon: 'underline' },
        { type: 'code',      icon: 'code' },
    ],
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
        'block-quote':   ({ children }) => <blockquote>{children}</blockquote>,
        'bulleted-list': ({ children }) => <ul>{children}</ul>,
        'numbered-list': ({ children, attributes }) => <ol {...attributes}>{children}</ol>,
        'heading-one':   ({ children }) => <h1>{children}</h1>,
        'heading-two':   ({ children }) => <h2>{children}</h2>,
        'heading-three': ({ children }) => <h3>{children}</h3>,
        'heading-four':  ({ children }) => <h4>{children}</h4>,
        'bulleted-list-item': ({ children }) => <li>{children}</li>,
        'numbered-list-item': ({ children }) => <li>{children}</li>,
        'image': (props) => {
			const { data } = props.node
			const src = data.get('src')
			return <img {...props.attributes} src={'https://img1.steemit.com/0x0/' + src} />
		},
		'link':  (props) => {
			const { data } = props.node
			const href = data.get('href')
console.log("rendering link...href=",href)
			return <a {...props.attributes} href={href}>{props.children}</a>
		},
    },
    marks: {
        bold:      props => <strong>{props.children}</strong>,
        code:      props => <code>{props.children}</code>,
        italic:    props => <em>{props.children}</em>,
        underline: props => <u>{props.children}</u>,
        strike:    props => <del>{props.children}</del>,
    },
}

export const getMarkdownType = (chars) => {
    switch (chars) {
        case '*':
        case '-': return 'bulleted-list-item';
        case '>': return 'block-quote';
        case '#': return 'heading-one';
        case '##': return 'heading-two';
        case '###': return 'heading-three';
        case '####': return 'heading-four';
        case '1.': return 'numbered-list-item';
        default: return null;
    }
}

