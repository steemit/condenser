import React from "react";
import MarkdownViewer from 'app/components/cards/MarkdownViewer';
import Icon from 'app/components/elements/Icon';
import {renderToString} from 'react-dom/server';

if (!process.env.BROWSER) {
    // please note we don't need to define require.context for client side rendering because it's defined by webpack
    const path = require('path');
    const fs = require('fs');
    function getFolderContents(folder, recursive) {
        return fs.readdirSync(folder).reduce(function (list, file) {
            var name = path.resolve(folder, file);
            var isDir = fs.statSync(name).isDirectory();
            return list.concat((isDir && recursive) ? getFolderContents(name, recursive) : [name]);
        }, []);
    }
    function requireContext(folder, recursive, pattern) {
        var normalizedFolder = path.resolve(path.dirname(module.filename), folder);
        var folderContents = getFolderContents(normalizedFolder, recursive)
            .filter(function (item) {
                if (item === module.filename) return false;
                return pattern.test(item);
            });

        var keys = function () {
            return folderContents;
        };
        var returnContext = function returnContext(item) {
            return fs.readFileSync(item, 'utf8');//require(item);
        };
        returnContext.keys = keys;
        return returnContext;
    }
    require.context = requireContext;
}

let req = require.context("../../help", true, /\.md/);
let HelpData = {};

function split_into_sections(str) {
    let sections = str.split(/\[#\s?(.+?)\s?\]/);
    if (sections.length === 1) return sections[0];
    if (sections[0].length < 4) sections.splice(0, 1);
    sections = sections.reduce((result, n) => {
        let last = result.length > 0 ? result[result.length-1] : null;
        if (!last || last.length === 2) { last = [n]; result.push(last); }
        else last.push(n);
        return result;
    }, []);
    return sections.reduce((result, n) => {
        result[n[0]] = n[1];
        return result;
    }, {});
}

export default class HelpContent extends React.Component {

    static propTypes = {
        path: React.PropTypes.string.isRequired,
        section: React.PropTypes.string
    };

    constructor(props) {
        super(props);
        this.locale = 'ru';
    }

    componentWillMount() {
        const md_file_path_regexp = new RegExp(`\/${this.locale}\/(.+)\.md$`)
        req.keys().filter(a => {
            return a.indexOf(`/${this.locale}/`) !== -1;
        }).forEach(filename => {
            var res = filename.match(md_file_path_regexp);
            let key = res[1];
            let help_locale = HelpData[this.locale];
            if (!help_locale) HelpData[this.locale] = help_locale = {};
            let content = req(filename);
            help_locale[key] = split_into_sections(content);
        });
    }

    setVars(str) {
        return str.replace(/(\{.+?\})/gi, (match, text) => {
            let key = text.substr(1, text.length - 2);
            let value = this.props[key] !== undefined ? this.props[key] : text;
            return value;
        });
    }

    render() {
        if (!HelpData[this.locale]) {
            console.error(`missing locale '${this.locale}' help files`);
            return null;
        }
        let value = HelpData[this.locale][this.props.path];
        if (!value && this.locale !== "en") {
            console.warn(`missing path '${this.props.path}' for locale '${this.locale}' help files, rolling back to 'en'`);
            value = HelpData['en'][this.props.path];
        }
        if (!value) {
            console.error(`help file not found '${this.props.path}' for locale '${this.locale}'`);
            return null;
        }
        if (this.props.section) value = value[this.props.section];
        if (!value) {
            console.error(`help section not found ${this.props.path}#${this.props.section}`);
            return null;
        }
        value = this.setVars(value);
        value = value.replace(/<Icon name="([A-Za-z0-9\_\-]+)" \/>/gi, (match, name) => {
            return renderToString(<Icon name={name} />);
        });
        return <MarkdownViewer className="HelpContent" text={value} allowDangerousHTML timeCteated={new Date()} />;
    }
}
