import React from 'react';
import PropTypes from 'prop-types';
import Dropzone from 'react-dropzone';
import tt from 'counterpart';
import DialogManager from 'app/components/elements/common/DialogManager';

export default class RawMarkdownEditor extends React.PureComponent {
    static propTypes = {
        value: PropTypes.string.isRequired,
        placeholder: PropTypes.string,
        uploadImage: PropTypes.func.isRequired,
        onChange: PropTypes.func.isRequired,
    };

    render() {
        const { value, placeholder } = this.props;

        return (
            <div className="RawMarkdownEditor">
                <Dropzone
                    className="dropzone"
                    disableClick
                    multiple={false}
                    accept="image/*"
                    onDrop={this._onDrop}
                    ref="dropzone"
                >
                    <textarea
                        className="RawMarkdownEditor__editor"
                        value={value}
                        rows="10"
                        placeholder={placeholder}
                        autoComplete="off"
                        onChange={this._onChange}
                        onPasteCapture={this._onPasteCapture}
                        ref="textarea"
                    />
                </Dropzone>
                <p className="RawMarkdownEditor__footer">
                    {tt('reply_editor.insert_images_by_dragging_dropping')}
                    <a onClick={this._onOpenClick}>
                        {tt('reply_editor.selecting_them')}
                    </a>
                    {tt('reply_editor.pasting_from_the_clipboard')}
                </p>
            </div>
        );
    }

    focus() {
        this.refs.textarea.focus();
    }

    getValue() {
        return this.refs.textarea.value;
    }

    _onDrop = (acceptedFiles, rejectedFiles) => {
        const file = acceptedFiles[0];

        if (!file) {
            if (rejectedFiles.length) {
                DialogManager.alert(
                    tt('reply_editor.please_insert_only_image_files')
                );
            }
            return;
        }

        this._uploadImage(file, file.name);
    };

    _onOpenClick = () => {
        this.refs.dropzone.open();
    };

    _onPasteCapture = e => {
        try {
            if (e.clipboardData) {
                for (let item of e.clipboardData.items) {
                    if (item.type.startsWith('image/')) {
                        this._uploadImage(item);
                    }
                }
            }
        } catch (error) {
            console.error('Error analyzing clipboard event', error);
        }
    };

    _onChange = () => {
        this.props.onChange(this.refs.editor.value);
    };

    _uploadImage(file, name = '') {
        // tt('reply_editor.uploading')

        this.props.uploadImage(file, progress => {
            if (progress.url) {
                const textarea = this.textarea;
                const { selectionStart, selectionEnd } = textarea;

                this.props.onChange(
                    textarea.value.substr(0, selectionStart) +
                        `![${name}](${progress.url})` +
                        textarea.value.substr(selectionEnd)
                );
            }
        });
    }
}
