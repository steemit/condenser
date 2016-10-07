import React from 'react'
import { Editor, Mark, Raw, Html } from 'slate'
import Portal from 'react-portal'
import position from 'selection-position'

import demoState from 'app/utils/SlateEditor/DemoState'
import {HtmlRules, schema, getMarkdownType} from 'app/utils/SlateEditor/Schema'

const serializer = new Html({rules: HtmlRules})
export const serializeHtml   = (state) => serializer.serialize(state)
export const deserializeHtml = (html)  => serializer.deserialize(html)
export const getDemoState    = ()      => Raw.deserialize(demoState, { terse: true })

const plugins = []


export default class SlateEditor extends React.Component {

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
        this.props.onChange(state)
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
        const type = getMarkdownType(chars)

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
                    {this.renderMarkButton('strike',    <del>S</del>)}
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
            <div className="SlateEditor Markdown">
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
