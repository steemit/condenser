import React from 'react';
import PropTypes from 'prop-types';
import tt from 'counterpart';
import DialogFrame from 'app/components/dialogs/DialogFrame';
import Input from 'app/components/elements/common/Input';
import keyCodes from 'app/utils/keyCodes';

export default class LinkOptionsDialog extends React.PureComponent {
    static propTypes = {
        onClose: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            link: props.link,
            text: props.text,
        };
    }

    render() {
        const { text, link } = this.state;

        return (
            <DialogFrame
                className="LinkOptionsDialog"
                title={tt('post_editor.add_image')}
                buttons={[
                    {
                        text: tt('g.cancel'),
                        onClick: this._onCloseClick,
                    },
                    {
                        text: tt('g.ok'),
                        primary: true,
                        onClick: this._onOkClick,
                    },
                ]}
                onCloseClick={this._onCloseClick}
            >
                <label className="LinkOptionsDialog__label">
                    {tt('editor_toolbar.link_text')}:
                    <Input
                        ref="text"
                        block
                        value={text}
                        autoFocus={!text}
                        onKeyDown={this._onKeyDown}
                        onChange={this._onTextChange}
                    />
                </label>
                <label className="LinkOptionsDialog__label">
                    {tt('editor_toolbar.link_value')}:
                    <Input
                        ref="link"
                        block
                        value={link}
                        autoFocus={text && !link}
                        onKeyDown={this._onKeyDown}
                        onChange={this._onLinkChange}
                    />
                </label>
            </DialogFrame>
        );
    }

    _onCloseClick = () => {
        this.props.onClose();
    };

    _onOkClick = () => {
        if (!this.state.text) {
            this.refs.text.focus();
        } else if (!this.state.link) {
            this.refs.link.focus();
        } else {
            this.props.onClose({
                text: this.state.text,
                link: this.state.link,
            });
        }
    };

    _onTextChange = e => {
        this.setState({
            text: e.target.value,
        });
    };

    _onLinkChange = e => {
        this.setState({
            link: e.target.value,
        });
    };

    _onKeyDown = e => {
        if (e.which === keyCodes.ENTER) {
            e.preventDefault();
            this._onOkClick();
        }
    };
}
