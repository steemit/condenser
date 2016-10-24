import React from 'react'
import { Editor, Plain, Raw } from 'slate'
import Portal from 'react-portal'
import position from 'selection-position'
import Icon from 'app/components/elements/Icon';

import {schema} from 'app/utils/SlateEditor/SchemaMarkdown'

const serializer = Plain
export const serializeMarkdown   = (state) => serializer.serialize(state)
export const deserializeMarkdown = (md)  => serializer.deserialize(md)

const DEFAULT_NODE = 'paragraph'

let plugins = []

if(process.env.BROWSER) {
    //import InsertImages from 'slate-drop-or-paste-images'
    const InsertImages = require('slate-drop-or-paste-images').default

    plugins.push(
        InsertImages({
            extensions: ['jpeg', 'jpg', 'png', 'gif'],
            applyTransform: (transform, file) => {
                return transform.insertInline({
                    type: 'image',
                    isVoid: true,
                    data: { file }
                })
            }
        })
    )

    // plugins.push(
    //     InsertBlockOnEnter({kind: 'block', type: DEFAULT_NODE, nodes: [{kind: 'text', text: '', ranges: []}]})
    // )

    // plugins.push(
    //     TrailingBlock({ type: DEFAULT_NODE })
    // )
}


export default class MarkdownEditor extends React.Component {

    constructor(props) {
        super(props)
        this.state = {state: props.initialState}
    }

    reset = () => {
        this.setState({state: this.props.initialState})
    }

    focus = () => {
        this.refs.editor.focus()
    }

    onChange = (state) => {
        //this.setState({ state })
        this.props.onChange(state)
    }

    // Markdown-style quick formatting
    onKeyDown = (e, data, state) => {
        if(data.isMod) return this.onModKeyDown(e, data, state);
        switch (data.key) {
            // case 'backspace': return this.onBackspace(e, state)
            case 'enter': return data.isShift ? this.onShiftEnter(e, state) : this.onEnter(e, state)
        }
    }

    // On backspace, if at the start of a non-paragraph, convert it back into a paragraph node.
    // onBackspace = (e, state) => {
    //     if (state.isExpanded) return
    //     if (state.startOffset != 0) return
    //     const { startBlock } = state
    // 
    //     if (startBlock.type == 'paragraph') return
    //     e.preventDefault()
    // 
    //     let transform = state
    //         .transform()
    //         .setBlock('paragraph')
    // 
    //     if (startBlock.type == 'list-item')
    //         transform = transform
    //             .unwrapBlock('bulleted-list')
    //             .unwrapBlock('numbered-list')
    // 
    //     state = transform.apply()
    //     return state
    // }

    onEnter = (e, state) => {
        e.preventDefault()
        return state
            .transform()
            .splitBlock()
            .setBlock('div')
            .apply()
    }

    onPaste = (e, data, state) => {
        console.log("** onPaste:", data.type, data.html)
        if (data.type != 'html') return null
        const { document } = serializer.deserialize(data.html)

        return state
            .transform()
            .insertFragment(document)
            .apply()
    }

    renderEditor = ({placeholder}) => {
        return (
            <div className="SlateEditor Markdown">
                <Editor
                    ref="editor"
                    schema={schema}
                    plugins={plugins}
                    placeholder={placeholder}
                    state={this.state.state}
                    onChange={this.onChange}
                    onKeyDown={this.onKeyDown}
                    onPaste={this.onPaste}
                    focus={this.focus}
                />
            </div>
        )
    }

    render = () => {
        const {placeholder} = this.props
        return (
            <div>
                {this.renderEditor({placeholder})}
            </div>
        )
    }

}


export const getInitalMarkdownState = () =>
    Raw.deserialize({
        nodes: [
            { kind: 'block', type: 'paragraph', nodes:
                [{ kind: 'text', ranges: [{text: ''}]
            }
        ]
    }]}, { terse: true })
