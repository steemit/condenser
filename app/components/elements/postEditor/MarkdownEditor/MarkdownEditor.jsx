import React from 'react';
import PropTypes from 'prop-types';
import debounce from 'lodash.debounce';
import Dropzone from 'react-dropzone';
import tt from 'counterpart';
import MarkdownEditorToolbar from 'app/components/elements/postEditor/MarkdownEditorToolbar';
import DialogManager from 'app/components/elements/common/DialogManager';

let SimpleMDE;

if (process.env.BROWSER) {
    SimpleMDE = require('simplemde');
}

let lastWidgetId = 0;

export default class MarkdownEditor extends React.Component {
    static propTypes = {
        initialValue: PropTypes.string,
        placeholder: PropTypes.string,
        onChangeNotify: PropTypes.func.isRequired,
        uploadImage: PropTypes.func.isRequired,
    };

    componentDidMount() {
        // Don't init on server
        if (!SimpleMDE) {
            return;
        }

        this._processTextLazy = debounce(this._processText, 100);

        this._simplemde = new SimpleMDE({
            spellChecker: false,
            status: false,
            placeholder: this.props.placeholder,
            initialValue: this.props.initialValue || '',
            element: this.refs.textarea,
            promptURLs: true,
            dragDrop: true,
            toolbar: false,
            autoDownloadFontAwesome: false,
            blockStyles: {
                italic: '_',
            },
        });

        this._lineWidgets = [];

        this._cm = this._simplemde.codemirror;
        this._cm.on('change', this._onChange);

        this.forceUpdate();

        // DEV: For experiments
        if (process.env.NODE_ENV !== 'production') {
            window.SM = SimpleMDE;
            window.sm = this._simplemde;
            window.cm = this._cm;
        }

        this._previewTimeout = setTimeout(() => {
            if (!this._unmount) {
                this._processText();
            }
        }, 500);

        this._fixTimeout = setTimeout(() => {
            if (!this._unmount) {
                this._tryToFixCursorPosition();
            }
        }, 1000);
    }

    componentWillUnmount() {
        this._unmount = true;

        clearTimeout(this._fixTimeout);
        clearTimeout(this._previewTimeout);

        this._cm.off('change', this._onChange);
        this._cm = null;
        this._simplemde = null;
    }

    render() {
        const { uploadImage } = this.props;

        return (
            <div className="MarkdownEditor">
                <Dropzone
                    className="MarkdownEditor__dropzone"
                    disableClick
                    multiple={false}
                    accept="image/*"
                    onDrop={this._onDrop}
                >
                    {this._simplemde ? (
                        <MarkdownEditorToolbar
                            editor={this._simplemde}
                            uploadImage={uploadImage}
                            SM={SimpleMDE}
                        />
                    ) : null}
                    <textarea ref="textarea" />
                </Dropzone>
            </div>
        );
    }

    focus() {
        this._cm.focus();
    }

    getValue() {
        return this._simplemde.value();
    }

    setValue(value) {
        this._simplemde.value(value);
    }

    _onChange = () => {
        this.props.onChangeNotify();
        this._processTextLazy();
    };

    _onDrop = (acceptedFiles, rejectedFiles, e) => {
        const file = acceptedFiles[0];

        if (!file) {
            if (rejectedFiles.length) {
                DialogManager.alert(
                    tt('reply_editor.please_insert_only_image_files')
                );
            }
            return;
        }

        const cursorPosition = this._cm.coordsChar({
            left: e.pageX,
            top: e.pageY,
        });

        this.props.uploadImage(file, progress => {
            if (progress.url) {
                const imageUrl = `![${file.name}](${progress.url})`;

                this._cm.replaceRange(imageUrl, cursorPosition);
            }
        });
    };

    _processText = () => {
        this._cutIframes();
        this._processImagesPreview();
    };

    _processImagesPreview() {
        const cm = this._cm;
        const alreadyWidgets = new Set();

        for (let widget of this._lineWidgets) {
            alreadyWidgets.add(widget);
        }

        for (let line = 0, last = cm.lineCount(); line < last; line++) {
            const lineContent = cm.getLine(line);

            let match;

            match = lineContent.match(/!\[[^\]]*\]\(([^)]+)\)/);

            if (!match) {
                match = lineContent.match(
                    /(?:^|\s)((?:https?:)?\/\/[^\s]+\.[^\s]+\.(?:jpe?g|png|gif))(?:\s|$)/
                );
            }

            if (match) {
                let url = match[1];

                if (!url.startsWith('http')) {
                    url = 'http:' + url;
                }

                if (this._addLineWidget(alreadyWidgets, line, url)) {
                    continue;
                }
            }

            match =
                lineContent.match(
                    /(?:^|\s)(?:https?:)?\/\/(?:www\.)?youtube\.com\/watch\?v=([A-Za-z0-9_-]{11})(?:\s|&|$)/
                ) ||
                lineContent.match(
                    /(?:^|\s)(?:https?:)?\/\/youtu\.be\/([A-Za-z0-9_-]{11})(?:\s|&|$)/
                );

            if (match) {
                this._addLineWidget(
                    alreadyWidgets,
                    line,
                    `https://img.youtube.com/vi/${match[1]}/0.jpg`
                );
            }
        }

        this._lineWidgets = this._lineWidgets.filter(
            widget => !alreadyWidgets.has(widget)
        );

        for (let widget of alreadyWidgets) {
            widget.clear();
        }
    }

    _cutIframes() {
        const text = this._simplemde.value();

        let updated = false;

        const updatedText = text.replace(
            /<iframe\s+([^>]*)>[\s\S]*<\/iframe>/g,
            (a, attrsStr) => {
                const match = attrsStr.match(/src="([^"]+)"/);

                if (match) {
                    let match2 = match[1].match(
                        /^https:\/\/www\.youtube\.com\/embed\/([A-Za-z0-9_-]+)/
                    );

                    if (match2) {
                        updated = true;
                        return `https://youtube.com/watch?v=${match2[1]}`;
                    }

                    match2 = match[1].match(
                        /^(?:https?:)?\/\/rutube\.ru\/play\/embed\/([A-Za-z0-9_-]+)/
                    );

                    if (match2) {
                        updated = true;
                        return `https://rutube.ru/video/${match2[1]}/`;
                    }

                    match2 = match[1].match(
                        /^(?:https?:)?\/\/ok\.ru\/videoembed\/([A-Za-z0-9_-]+)/
                    );

                    if (match2) {
                        updated = true;
                        return `https://ok.ru/video/${match2[1]}`;
                    }
                }
            }
        );

        if (updated) {
            for (let w of this._lineWidgets) {
                w.clear();
            }

            this._lineWidgets = [];

            const cursor = this._cm.getCursor();
            console.log(cursor);
            this._simplemde.value(updatedText);
            setTimeout(() => {
                this._cm.setCursor(cursor);
            }, 0);
        }
    }

    _addLineWidget(alreadyWidgets, line, url) {
        for (let widget of this._lineWidgets) {
            if (widget.line.lineNo() === line) {
                if (widget.url === url) {
                    alreadyWidgets.delete(widget);
                    return;
                }
            }
        }

        const img = new Image();
        img.classList.add('MarkdownEditor__preview');

        img.addEventListener('load', () => {
            const widget = this._cm.addLineWidget(line, img, {
                handleMouseEvents: true,
            });
            widget.id = ++lastWidgetId;
            widget.url = url;
            this._lineWidgets.push(widget);
        });

        img.addEventListener('error', () => {
            const div = document.createElement('div');
            div.classList.add('MarkdownEditor__preview-error');
            div.innerText = tt('post_editor.image_preview_error');
            const widget = this._cm.addLineWidget(line, div, {
                handleMouseEvents: true,
            });
            widget.id = ++lastWidgetId;
            widget.url = url;
            this._lineWidgets.push(widget);
        });

        img.src = $STM_Config.img_proxy_prefix + '0x0/' + url;
    }

    _tryToFixCursorPosition() {
        // Hack: Need some action for fix cursor position
        if (this.props.initialValue) {
            this._cm.execCommand('selectAll');
            this._cm.execCommand('undoSelection');
        } else {
            this._cm.execCommand('goLineEnd');
            this._cm.replaceSelection(' ');
            this._cm.execCommand('delCharBefore');
        }
    }
}
