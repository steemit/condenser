import React from 'react';

let RichTextEditor;

if (process.env.BROWSER) {
    RichTextEditor = require('react-rte-image').default;
}

export default class HtmlEditor extends React.PureComponent {
    static createValueFromString(htmlString) {
        return RichTextEditor.createValueFromString(htmlString, 'html');
    }

    static getStateFromHtml(html) {
        if (html) {
            html = stripHtmlWrapper(html).trim();
        }

        if (html) {
            return RichTextEditor.createValueFromString(html, 'html');
        } else {
            return RichTextEditor.createEmptyValue();
        }
    }

    render() {
        // Don't try to render on server
        if (!RichTextEditor) {
            return;
        }

        return (
            <RichTextEditor
                className="HtmlEditor"
                value={this.props.value}
                onChange={this.props.onChange}
                ref="editor"
            />
        );
    }

    getValue() {
        const html = this.props.value.toString('html');

        if (html === '<p></p>' || html === '<p><br></p>' || html === '') {
            return '';
        }

        return `<html>\n${html}\n</html>`;
    }

    isEmpty() {
        return !this.getValue();
    }
}

function stripHtmlWrapper(text) {
    const match = text.match(/<html>\n*([\s\S]+?)?\n*<\/html>/);
    return match && match.length === 2 ? match[1] : text;
}
