import React from 'react';
import Slate, { Editor, Mark, Raw, Html } from 'slate';
import Portal from 'react-portal';
import position from 'selection-position';
import Icon from 'app/components/elements/Icon';
import ReactDOMServer from 'react-dom/server';

import { getCollapsedClientRect } from 'app/utils/SlateEditor/Helpers';
import demoState from 'app/utils/SlateEditor/DemoState';
import {
    HtmlRules,
    schema,
    getMarkdownType,
} from 'app/utils/SlateEditor/Schema';

const serializer = new Html({ rules: HtmlRules });
export const serializeHtml = state =>
    serializer
        .serialize(state, { render: false })
        .map(el => ReactDOMServer.renderToStaticMarkup(el))
        .join('\n');
export const deserializeHtml = html => serializer.deserialize(html);
export const getDemoState = () => Raw.deserialize(demoState, { terse: true });

const DEFAULT_NODE = 'paragraph';

let plugins = [];

import InsertBlockOnEnter from 'slate-insert-block-on-enter';
import TrailingBlock from 'slate-trailing-block';

if (process.env.BROWSER) {
    //import InsertImages from 'slate-drop-or-paste-images'
    const InsertImages = require('slate-drop-or-paste-images').default;

    plugins.push(
        InsertImages({
            extensions: ['jpeg', 'png', 'gif'],
            applyTransform: (transform, file) => {
                return transform.insertInline({
                    type: 'image',
                    isVoid: true,
                    data: { file },
                });
            },
        })
    );

    plugins.push(
        InsertBlockOnEnter({
            kind: 'block',
            type: DEFAULT_NODE,
            nodes: [{ kind: 'text', text: '', ranges: [] }],
        })
    );
    plugins.push(TrailingBlock({ type: DEFAULT_NODE }));
}

export default class SlateEditor extends React.Component {
    constructor(props) {
        super(props);
        this.state = { state: props.initialState };
    }

    reset = () => {
        this.setState({ state: this.props.initialState });
    };

    componentDidMount = () => {
        this.updateMenu();
        this.updateSidebar();
    };

    componentDidUpdate = () => {
        this.updateMenu();
        this.updateSidebar();
    };

    onChange = state => {
        //this.setState({ state })
        this.props.onChange(state);
    };

    // When the portal opens, cache the menu element.
    onMenuOpen = portal => {
        this.setState({ menu: portal.firstChild });
    };

    // When the portal opens, cache the menu element.
    onSidebarOpen = portal => {
        this.setState({ sidebar: portal.firstChild });
    };

    // Check if the current selection has a mark with `type` in it.
    hasMark = type => {
        const { state } = this.state;
        if (!state.isExpanded) return;
        return state.marks.some(mark => mark.type == type);
    };

    // Check if the current selection has a block with `type` in it.
    hasBlock = type => {
        const { state } = this.state;
        const { document } = state;
        return state.blocks.some(
            node =>
                node.type == type ||
                !!document.getClosest(node, parent => parent.type == type)
        );
    };

    // Check if the current selection has an inline of `type`.
    hasInline = type => {
        const { state } = this.state;
        return state.inlines.some(inline => inline.type == type);
    };

    // When a mark button is clicked, toggle the current mark.
    onClickMark = (e, type) => {
        e.preventDefault();
        let { state } = this.state;

        state = state
            .transform()
            .toggleMark(type)
            .apply();

        this.setState({ state });
    };

    // Toggle block type
    onClickBlock = (e, type) => {
        e.preventDefault();
        let { state } = this.state;
        let transform = state.transform();
        const { document } = state;

        // Handle everything but list buttons.
        if (type != 'bulleted-list' && type != 'numbered-list') {
            const isActive = this.hasBlock(type);
            const isList = this.hasBlock('list-item');

            if (isList) {
                transform = transform
                    .setBlock(isActive ? DEFAULT_NODE : type)
                    .unwrapBlock('bulleted-list')
                    .unwrapBlock('numbered-list');
            } else {
                transform = transform.setBlock(isActive ? DEFAULT_NODE : type);
            }
        } else {
            // Handle the extra wrapping required for list buttons.
            const isList = this.hasBlock('list-item');
            const isType = state.blocks.some(block => {
                return !!document.getClosest(
                    block,
                    parent => parent.type == type
                );
            });

            if (isList && isType) {
                transform = transform
                    .setBlock(DEFAULT_NODE)
                    .unwrapBlock('bulleted-list')
                    .unwrapBlock('numbered-list');
            } else if (isList) {
                transform = transform
                    .unwrapBlock(
                        type == 'bulleted-list'
                            ? 'numbered-list'
                            : 'bulleted-list'
                    )
                    .wrapBlock(type);
            } else {
                transform = transform.setBlock('list-item').wrapBlock(type);
            }
        }

        state = transform.apply();
        this.setState({ state });
    };

    onClickLink = e => {
        e.preventDefault();
        let { state } = this.state;
        const hasLinks = this.hasInline('link');

        if (hasLinks) {
            state = state
                .transform()
                .unwrapInline('link')
                .apply();
        } else if (state.isExpanded) {
            const href = window.prompt(
                'Enter the URL of the link:',
                'http://steemit.com'
            );
            if (href) {
                state = state
                    .transform()
                    .wrapInline({
                        type: 'link',
                        data: { href },
                    })
                    .collapseToEnd()
                    .apply();
            }
        } else {
            const href = window.prompt('Enter the URL of the link:');
            const text = window.prompt('Enter the text for the link:');
            state = state
                .transform()
                .insertText(text)
                .extendBackward(text.length)
                .wrapInline({
                    type: 'link',
                    data: { href },
                })
                .collapseToEnd()
                .apply();
        }
        this.setState({ state });
    };

    // Markdown-style quick formatting
    onKeyDown = (e, data, state) => {
        if (data.isMod) return this.onModKeyDown(e, data, state);
        switch (data.key) {
            case 'space':
                return this.onSpace(e, state);
            case 'backspace':
                return this.onBackspace(e, state);
            case 'enter':
                return data.isShift
                    ? this.onShiftEnter(e, state)
                    : this.onEnter(e, state);
        }
    };

    onModKeyDown = (e, data, state) => {
        let mark;
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
                return this.onClickLink(e);
        }

        if (!mark) return;

        state = state
            .transform()
            .toggleMark(mark)
            .apply();

        e.preventDefault();
        return state;
    };

    // If space was entered, check if it was a markdown sequence
    onSpace = (e, state) => {
        if (state.isExpanded) return;
        let { selection } = state;
        const { startText, startBlock, startOffset } = state;
        const chars = startBlock.text.slice(0, startOffset); //.replace(/\s*/g, '')
        const type = getMarkdownType(chars);

        if (!type) return;
        if (type == 'list-item' && startBlock.type == 'list-item') return;
        e.preventDefault();

        let transform = state.transform().setBlock(type);

        if (type == 'list-item' && chars != '1.')
            transform = transform.wrapBlock('bulleted-list');
        if (type == 'list-item' && chars == '1.')
            transform = transform.wrapBlock('numbered-list');

        state = transform
            .extendToStartOf(startBlock)
            .delete()
            .apply();

        return state;
    };

    // On backspace, if at the start of a non-paragraph, convert it back into a paragraph node.
    onBackspace = (e, state) => {
        if (state.isExpanded) return;
        if (state.startOffset != 0) return;
        const { startBlock } = state;

        if (startBlock.type == 'paragraph') return;
        e.preventDefault();

        let transform = state.transform().setBlock('paragraph');

        if (startBlock.type == 'list-item')
            transform = transform
                .unwrapBlock('bulleted-list')
                .unwrapBlock('numbered-list');

        state = transform.apply();
        return state;
    };

    onShiftEnter = (e, state) => {
        if (state.isExpanded) return;
        const { startBlock, startOffset, endOffset } = state;

        // Allow soft returns for certain block types
        if (
            startBlock.type == 'paragraph' ||
            startBlock.type == 'code-block' ||
            startBlock.type == 'block-quote'
        ) {
            let transform = state.transform();
            if (state.isExpanded) transform = transform.delete();
            transform = transform.insertText('\n');
            return transform.apply();
        }
    };

    onEnter = (e, state) => {
        if (state.isExpanded) return;
        const { startBlock, startOffset, endOffset } = state;

        // On return, if at the end of a node type that should not be extended, create a new paragraph below it.
        if (startOffset == 0 && startBlock.length == 0)
            return this.onBackspace(e, state); //empty block
        if (endOffset != startBlock.length) return; //not at end of block

        if (
            startBlock.type != 'heading-one' &&
            startBlock.type != 'heading-two' &&
            startBlock.type != 'heading-three' &&
            startBlock.type != 'heading-four' &&
            startBlock.type != 'block-quote' &&
            startBlock.type != 'code-block'
        )
            return;

        e.preventDefault();
        return state
            .transform()
            .splitBlock()
            .setBlock('paragraph')
            .apply();
    };

    onPaste = (e, data, state) => {
        console.log('** onPaste:', data.type, data.html);
        if (data.type != 'html') return;
        const { document } = serializer.deserialize(data.html);

        return state
            .transform()
            .insertFragment(document)
            .apply();
    };

    renderSidebar = () => {
        const { state } = this.state;
        const isOpen = state.isExpanded && state.isFocused;
        return (
            <Portal isOpened onOpen={this.onSidebarOpen}>
                <div className="SlateEditor__sidebar">
                    {this.renderAddBlockButton({
                        type: 'image',
                        label: <Icon name="photo" />,
                        handler: this.onClickInsertImage,
                    })}
                    {this.renderAddBlockButton({
                        type: 'video',
                        label: <Icon name="video" />,
                        handler: this.onClickInsertVideo,
                    })}
                    {this.renderAddBlockButton({
                        type: 'hrule',
                        label: <Icon name="line" />,
                        handler: this.onClickInsertHr,
                    })}
                </div>
            </Portal>
        );
    };

    onClickInsertImage = e => {
        e.preventDefault();
        let { state } = this.state;

        const src = window.prompt('Enter the URL of the image:', '');
        if (!src) return;

        state = state
            .transform()
            .insertInline({ type: 'image', isVoid: true, data: { src } })
            //.insertBlock({type: 'paragraph', isVoid: false, nodes: [Slate.Text.create()]})
            .focus()
            .collapseToEndOfNextBlock()
            .apply();

        this.setState({ state });
    };

    onClickInsertVideo = (e, type) => {
        e.preventDefault();
        let { state } = this.state;

        state = state
            .transform()
            .insertBlock({ type: 'embed', isVoid: true, data: { src: '' } })
            //.insertBlock({type: 'paragraph', isVoid: false})
            .apply();

        this.setState({ state });
    };

    onClickInsertHr = (e, type) => {
        e.preventDefault();
        let { state } = this.state;

        state = state
            .transform()
            .insertBlock({ type: 'hr', isVoid: true })
            .insertBlock({ type: 'paragraph', isVoid: false })
            .apply();

        this.setState({ state });
    };

    renderAddBlockButton = props => {
        const { type, label, handler } = props;
        const onMouseDown = e => handler(e);

        return (
            <span
                key={type}
                className="SlateEditor__sidebar-button"
                onMouseDown={onMouseDown}
            >
                {label}
            </span>
        );
    };

    renderMenu = () => {
        const { state } = this.state;
        const isOpen = state.isExpanded && state.isFocused;

        return (
            <Portal isOpened onOpen={this.onMenuOpen}>
                <div className="SlateEditor__menu SlateEditor__menu">
                    {schema.toolbarMarks.map(this.renderMarkButton)}
                    {this.renderInlineButton({
                        type: 'link',
                        label: <Icon name="link" />,
                    })}
                    {this.renderBlockButton({
                        type: 'block-quote',
                        label: <span>&ldquo;</span>,
                    })}
                    {this.renderBlockButton({
                        type: 'heading-one',
                        label: 'H1',
                    })}
                    {this.renderBlockButton({
                        type: 'heading-two',
                        label: 'H2',
                    })}
                    {/*this.renderBlockButton({type: 'bulleted-list', label: 'ul'})*/}
                    {/*this.renderBlockButton({type: 'numbered-list', label: 'ol'})*/}
                    {this.renderBlockButton({
                        type: 'code-block',
                        label: '<>',
                    })}
                </div>
            </Portal>
        );
    };

    renderMarkButton = props => {
        const { type, label } = props;
        const isActive = this.hasMark(type);
        const onMouseDown = e => this.onClickMark(e, type);

        return (
            <span
                key={type}
                className={
                    'SlateEditor__menu-button SlateEditor__menu-button-' + type
                }
                onMouseDown={onMouseDown}
                data-active={isActive}
            >
                <span>{label}</span>
            </span>
        );
    };

    renderBlockButton = props => {
        const { type, label } = props;
        const isActive = this.hasBlock(type);
        const onMouseDown = e => this.onClickBlock(e, type);

        return (
            <span
                key={type}
                className={
                    'SlateEditor__menu-button SlateEditor__menu-button-' + type
                }
                onMouseDown={onMouseDown}
                data-active={isActive}
            >
                <span>{label}</span>
            </span>
        );
    };

    renderInlineButton = props => {
        const { type, label } = props;
        const isActive = this.hasInline(type);
        const onMouseDown = e => this.onClickLink(e, type);

        return (
            <span
                key={type}
                className={
                    'SlateEditor__menu-button SlateEditor__menu-button-' + type
                }
                onMouseDown={onMouseDown}
                data-active={isActive}
            >
                <span>{label}</span>
            </span>
        );
    };

    renderEditor = () => {
        return (
            <div className="SlateEditor Markdown">
                <Editor
                    schema={schema}
                    placeholder={this.props.placeholder || 'Enter some text...'}
                    plugins={plugins}
                    state={this.state.state}
                    onChange={this.onChange}
                    onKeyDown={this.onKeyDown}
                    onPaste={this.onPaste}
                />
            </div>
        );
    };

    // move sidebar to float left of current blank paragraph
    updateSidebar = () => {
        const { sidebar, state } = this.state;
        if (!sidebar) return;

        const rect = getCollapsedClientRect();
        if (state.isBlurred || state.isExpanded || !rect) {
            sidebar.removeAttribute('style');
            return;
        }

        sidebar.style.top = `${rect.top + window.scrollY}px`;
        sidebar.style.left = `${rect.left +
            window.scrollX -
            sidebar.offsetWidth}px`;
    };

    // move menu to center above current selection
    updateMenu = () => {
        const { menu, state } = this.state;
        if (!menu) return;

        if (state.isBlurred || state.isCollapsed) {
            menu.removeAttribute('style');
            return;
        }

        const rect = position();
        menu.style.top = `${rect.top + window.scrollY - menu.offsetHeight}px`;
        menu.style.left = `${rect.left +
            window.scrollX -
            menu.offsetWidth / 2 +
            rect.width / 2}px`;
    };

    render = () => {
        const { state } = this.state;
        return (
            <div>
                {this.renderMenu()}
                {this.renderSidebar()}
                {this.renderEditor()}
            </div>
        );
    };
}
