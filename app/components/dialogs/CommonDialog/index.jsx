import React from 'react';
import PropTypes from 'prop-types';
import tt from 'counterpart';
import DialogFrame from 'app/components/dialogs/DialogFrame';

const TYPES = {
    info: {
        title: 'dialog.info',
    },
    alert: {
        title: 'dialog.alert',
    },
    confirm: {
        title: 'dialog.confirm',
    },
    prompt: {
        title: 'dialog.prompt',
    },
};

export default class CommonDialog extends React.PureComponent {
    static propTypes = {
        type: PropTypes.oneOf(['info', 'alert', 'confirm', 'prompt']),
        title: PropTypes.string,
        text: PropTypes.string,
        onClose: PropTypes.func.isRequired,
    };

    render() {
        const { text, title, type = 'info' } = this.props;

        const options = TYPES[type];

        return (
            <DialogFrame
                className="CommonDialog"
                title={title || tt(options.title)}
                buttons={this._getButtons()}
                onCloseClick={this._onCloseClick}
            >
                {text}
                {type === 'prompt' ? (
                    <input
                        className="CommonDialog__prompt-input"
                        ref="input"
                        autoFocus
                    />
                ) : null}
            </DialogFrame>
        );
    }

    _getButtons() {
        const { type, danger } = this.props;

        if (type === 'prompt') {
            return [
                {
                    text: tt('g.cancel'),
                    onClick: this._onCloseClick,
                },
                { text: tt('g.ok'), primary: true, onClick: this._onOkClick },
            ];
        }

        if (type === 'confirm') {
            return [
                {
                    text: tt('g.cancel'),
                    onClick: this._onCloseClick,
                },
                {
                    text: tt('g.ok'),
                    primary: true,
                    warning: danger,
                    autoFocus: true,
                    onClick: this._onOkClick,
                },
            ];
        }

        if (type === 'alert') {
            return [
                {
                    text: tt('g.ok'),
                    warning: true,
                    autoFocus: true,
                    onClick: this._onOkClick,
                },
            ];
        }

        return [
            {
                text: tt('g.ok'),
                primary: true,
                autoFocus: true,
                onClick: this._onOkClick,
            },
        ];
    }

    _onOkClick = () => {
        const { type, onClose } = this.props;

        if (type === 'prompt') {
            onClose(this.refs.input.value);
        } else if (type === 'confirm') {
            onClose(true);
        } else {
            onClose();
        }
    };

    _onCloseClick = () => {
        this.props.onClose();
    };
}
