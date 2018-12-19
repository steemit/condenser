import React, { Component } from 'react';
import ReactDOM from 'react-dom';
// import PropTypes from 'prop-types';

import MediumEditor from 'medium-editor';

class HighLight extends Component {
    state = {
        staticOptions: {
            // disableEditing: true,
            toolbar: {
                buttons: [
                    {
                        name: 'h1',
                        action: this.onAction('create'),
                        aria: 'Create Post',
                        tagNames: ['h2'],
                        contentDefault: '<b>Create</b>',
                        classList: ['Button', 'CreatePost'],
                    },
                    {
                        name: 'h2',
                        action: this.onAction('share'),
                        aria: 'Share',
                        tagNames: ['h2'],
                        contentDefault: '<b>Share</b>',
                        classList: ['Button', 'Share'],
                    },
                    {
                        name: 'h3',
                        action: this.onAction('tweet'),
                        aria: 'Tweet',
                        tagNames: ['h2'],
                        contentDefault: '<b>Tweet</b>',
                        classList: ['Button', 'Tweet'],
                    },
                ],
                standardizeSelectionStart: true,
            },
        },
    };

    componentDidMount() {
        const dom = ReactDOM.findDOMNode(this); // eslint-disable-line
        this.medium = new MediumEditor(
            dom,
            Object.assign(this.state.staticOptions, this.props.options || {})
        );
    }

    componentDidUpdate() {
        this.medium.restoreSelection();
    }

    componentWillUnmount() {
        this.medium.destroy();
    }

    onAction(type) {
        return options => {
            const selection = options.contentWindow.getSelection();
            if (selection.type === 'None') return;
            const start = Math.min(selection.baseOffset, selection.focusOffset);
            const offset =
                selection.baseOffset + selection.focusOffset - start * 2;
            const highLight = selection.anchorNode.data.substr(start, offset);

            if (type === 'create') {
                localStorage.setItem('high_light', highLight);
                location.href = '/static_create';
            }
        };
    }

    render() {
        return <div data-disable-editing>{this.props.children}</div>;
    }
}

export default HighLight;
