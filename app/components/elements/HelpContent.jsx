import React from 'react';
import MarkdownViewer from 'app/components/cards/MarkdownViewer';
import Icon from 'app/components/elements/Icon';
import { renderToString } from 'react-dom/server';

let faqMarkdown;

if (process.env.BROWSER) {
    faqMarkdown = require('../../help/en/faq.md');
} else if (!faqMarkdown) {
    faqMarkdown = require('fs').readFileSync('app/help/en/faq.md', 'utf-8');
}

const faq = splitIntoSections(faqMarkdown);

export default class HelpContent extends React.PureComponent {
    render() {
        let value = faq;

        value = this._setVars(value);
        value = value.replace(
            /<Icon name="([A-Za-z0-9_-]+)" \/>/gi,
            (match, name) => renderToString(<Icon name={name} />)
        );

        return (
            <MarkdownViewer
                className="HelpContent"
                text={value}
                allowDangerousHTML
                timeCteated={new Date()}
            />
        );
    }

    _setVars(str) {
        return str.replace(/(\{.+?\})/gi, (match, text) => {
            const key = text.substr(1, text.length - 2);
            return this.props[key] !== undefined ? this.props[key] : text;
        });
    }
}

function splitIntoSections(str) {
    let sections = str.split(/\[#\s?(.+?)\s?\]/);

    if (sections.length === 1) {
        return sections[0];
    }

    if (sections[0].length < 4) {
        sections.splice(0, 1);
    }

    sections = sections.reduce((result, n) => {
        let last = result.length > 0 ? result[result.length - 1] : null;
        if (!last || last.length === 2) {
            last = [n];
            result.push(last);
        } else {
            last.push(n);
        }
        return result;
    }, []);

    return sections.reduce((result, n) => {
        result[n[0]] = n[1];
        return result;
    }, {});
}
