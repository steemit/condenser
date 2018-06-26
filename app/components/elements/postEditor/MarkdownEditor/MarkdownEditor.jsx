import React from 'react';
import PropTypes from 'prop-types';
import Dropzone from 'react-dropzone';
import tt from 'counterpart';
import MarkdownEditorToolbar from 'app/components/elements/postEditor/MarkdownEditorToolbar';
import DialogManager from 'app/components/elements/common/DialogManager';

let SimpleMDE;

if (process.env.BROWSER) {
    SimpleMDE = require('simplemde');
}

export default class MarkdownEditor extends React.Component {
    static propTypes = {
        initialValue: PropTypes.string,
        placeholder: PropTypes.string,
        onChangeNotify: PropTypes.func.isRequired,
    };

    componentDidMount() {
        // Don't init on server
        if (!SimpleMDE) {
            return;
        }

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

        this._cm = this._simplemde.codemirror;
        this._cm.on('change', this._onChange);

        this.forceUpdate();

        // DEV: For experiments
        if (process.env.NODE_ENV !== 'production') {
            window.SM = SimpleMDE;
            window.sm = this._simplemde;
            window.cm = this._cm;
        }
    }

    componentWillUnmount() {
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
}
