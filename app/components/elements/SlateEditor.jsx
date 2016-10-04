/*
import EditBlockquote from 'slate-edit-blockquote'
import TrailingBlock from 'slate-trailing-block'

const plugins = [
    TrailingBlock({ type: 'paragraph' }),
    EditBlockquote()
]
*/
const plugins = []

import { Editor, Mark, Raw, Html } from 'slate'
import Portal from 'react-portal'
import React from 'react'
import position from 'selection-position'

const serializer = new Html({rules: [
    {
        deserialize: (el, next) => null,
        serialize: (object, children) => {
            if(object.kind == 'string') return;
            if(object.kind == 'block') {
                switch(object.type) {
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
            if(object.kind == 'mark') {
                switch(object.type) {
                    case 'bold':      return <strong>{children}</strong>
                    case 'italic':    return <i>{children}</i>
                    case 'underline': return <u>{children}</u>
                    case 'strike':    return <s>{children}</s>
                    case 'code':      return <code>{children}</code>
                }
            }

            console.log("No serializer: ", object.kind, JSON.stringify(object, null, 2), children)
        }
    },
]})

const schema = {
    defaultNode: 'paragraph',
    //blockTypes: {
    //  ...Blocks,
    //},
    toolbarMarks: [
        { type: 'bold', icon: 'bold' },
        { type: 'italic', icon: 'italic' },
        { type: 'underline', icon: 'underline' },
        { type: 'code', icon: 'code' },
    ],
    toolbarTypes: [
        { type: 'heading-one', icon: 'header' },
        { type: 'heading-two', icon: 'header' },
        { type: 'block-quote', icon: 'quote-left' },
        { type: 'numbered-list', icon: 'list-ol' },
        { type: 'bulleted-list', icon: 'list-ul' },
    ],
    sidebarTypes: [],
    nodes: {
        'block':   ({ children }) => <p style={{background: 'red'}}>{children}</p>,
        'paragraph':   ({ children }) => <p style={{color: 'blue'}}>{children}</p>,
        'block-quote':   ({ children }) => <blockquote>{children}</blockquote>,
        'bulleted-list': ({ children }) => <ul>{children}</ul>,
        'numbered-list': ({ children, attributes }) => <ol {...attributes}>{children}</ol>,
        'heading-one':   ({ children }) => <h1>{children}</h1>,
        'heading-two':   ({ children }) => <h2>{children}</h2>,
        'heading-three': ({ children }) => <h3>{children}</h3>,
        'heading-four':  ({ children }) => <h4>{children}</h4>,
        'bulleted-list-item': ({ children }) => <li>{children}</li>,
        'numbered-list-item': ({ children }) => <li>{children}</li>,
    },
    marks: {
        bold:      props => <strong>{props.children}</strong>,
        code:      props => <code>{props.children}</code>,
        italic:    props => <em>{props.children}</em>,
        underline: props => <u>{props.children}</u>,
        strike:    props => <s>{props.children}</s>,
    },
    getMarkdownType: (chars) => {
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
    },
}


class SlateEditor extends React.Component {

    constructor(props) {
        super(props)
        this.state = {state: props.initialState}
    }

    componentDidMount = () => {
        this.updateMenu()
    }

    componentDidUpdate = () => {
        this.updateMenu()
    }

    // Check if the current selection has a mark with `type` in it.
    hasMark = (type) => {
        const { state } = this.state
        return state.marks.some(mark => mark.type == type)
    }

    onChange = (state) => {
        this.setState({ state })
    }

    // When a mark button is clicked, toggle the current mark.
    onClickMark = (e, type) => {
        e.preventDefault()
        let { state } = this.state

        state = state
            .transform()
            .toggleMark(type)
            .apply()

        this.setState({ state })
    }

    // When the portal opens, cache the menu element.
    onOpen = (portal) => {
        this.setState({ menu: portal.firstChild })
    }


    // Markdown-style quick formatting
    onKeyDown = (e, data, state) => {
        switch (data.key) {
            case 'space': return this.onSpace(e, state)
            case 'backspace': return this.onBackspace(e, state)
            case 'enter': return this.onEnter(e, state)
        }
    }

    // If space was entered, check if it was a markdown sequence
    onSpace = (e, state) => {
        if (state.isExpanded) return
        let { selection } = state
        const { startText, startBlock, startOffset } = state
        const chars = startBlock.text.slice(0, startOffset).replace(/\s*/g, '')
        const type = schema.getMarkdownType(chars)

        if (!type) return
        if (type == 'bulleted-list-item' && startBlock.type == 'bulleted-list-item') return
        if (type == 'numbered-list-item' && startBlock.type == 'numbered-list-item') return
        e.preventDefault()

        let transform = state
            .transform()
            .setBlock(type)

        if (type == 'bulleted-list-item') transform = transform.wrapBlock('bulleted-list')
        if (type == 'numbered-list-item') transform = transform.wrapBlock('numbered-list')

        state = transform
            .extendToStartOf(startBlock)
            .delete()
            .apply()

        return state
    }

    // On backspace, if at the start of a non-paragraph, convert it back into a paragraph node.
    onBackspace = (e, state) => {
        if (state.isExpanded) return
        if (state.startOffset != 0) return
        const { startBlock } = state

        if (startBlock.type == 'paragraph') return
        e.preventDefault()

        let transform = state
            .transform()
            .setBlock('paragraph')

        if (startBlock.type == 'bulleted-list-item') transform = transform.unwrapBlock('bulleted-list')
        if (startBlock.type == 'numbered-list-item') transform = transform.unwrapBlock('numbered-list')

        state = transform.apply()
        return state
    }

    // On return, if at the end of a node type that should not be extended, create a new paragraph below it.
    onEnter = (e, state) => {
        if (state.isExpanded) return //menu open
        const { startBlock, startOffset, endOffset } = state
        if (startOffset == 0 && startBlock.length == 0) return this.onBackspace(e, state) //empty block
        if (endOffset != startBlock.length) return //not at end of block

        if (
            startBlock.type != 'heading-one' &&
            startBlock.type != 'heading-two' &&
            startBlock.type != 'heading-three' &&
            startBlock.type != 'heading-four' &&
            startBlock.type != 'block-quote'
        ) return
        
        e.preventDefault()
        return state
            .transform()
            .splitBlock()
            .setBlock('paragraph')
            .apply()
    }


    render = () => {
        const { state } = this.state
        console.log(serializer.serialize(state));
        return (
            <div>
                {this.renderMenu()}
                {this.renderEditor()}
            </div>
        )
    }

    renderMenu = () => {
        const { state } = this.state
        const isOpen = state.isExpanded && state.isFocused
        return (
            <Portal isOpened onOpen={this.onOpen}>
                <div className="SlateEditor__menu SlateEditor__hover-menu">
                    {this.renderMarkButton('bold',      <strong>B</strong>)}
                    {this.renderMarkButton('italic',    <i>I</i>)}
                    {this.renderMarkButton('underline', <u>U</u>)}
                    {this.renderMarkButton('strike',    <s>S</s>)}
                    {this.renderMarkButton('code',      <code>{'{}'}</code>)}
                </div>
            </Portal>
        )
    }

    renderMarkButton = (type, label) => {
        const isActive = this.hasMark(type)
        const onMouseDown = e => this.onClickMark(e, type)

        return (
            <span className="SlateEditor__menu-button" onMouseDown={onMouseDown} data-active={isActive}>
                <span>{label}</span>
            </span>
        )
    }

    renderEditor = () => {
        return (
            <div className="SlateEditor">
                <Editor
                    schema={schema}
                    plugins={plugins}
                    state={this.state.state}
                    onChange={this.onChange}
                    onKeyDown={this.onKeyDown}
                />
            </div>
        )
    }

    updateMenu = () => {
        const { menu, state } = this.state
        if (!menu) return

        if (state.isBlurred || state.isCollapsed) {
          menu.removeAttribute('style')
          return
        }

        const rect = position()
        menu.style.opacity = 1
        menu.style.top = `${rect.top + window.scrollY - menu.offsetHeight}px`
        menu.style.left = `${rect.left + window.scrollX - menu.offsetWidth / 2 + rect.width / 2}px`
    }
}

export default SlateEditor
