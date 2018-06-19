import React from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import tt from 'counterpart';
import Icon from 'app/components/elements/Icon';

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

export default class Dialog extends React.PureComponent {
    static propTypes = {
        type: PropTypes.oneOf(['info', 'alert', 'confirm', 'prompt']),
        onClose: PropTypes.func.isRequired,
    };

    render() {
        const { text, title, type } = this.props;

        const options = TYPES[type];

        return (
            <form className="Dialog" onSubmit={this._onSubmit}>
                <Icon
                    name="cross"
                    className="Dialog__close"
                    onClick={this._onCloseClick}
                />
                <div className="Dialog__header">
                    {title || tt(options.title)}
                </div>
                <div className="Dialog__content">
                    {text}
                    {type === 'prompt' ? (
                        <input
                            className="Dialog__prompt-input"
                            ref="input"
                            autoFocus
                        />
                    ) : null}
                </div>
                {type === 'prompt' ? (
                    <div className="Dialog__footer">
                        {this._renderButton(tt('g.cancel'), {
                            onClick: () => this.props.onClose(),
                        })}
                        {this._renderButton(tt('g.ok'), { primary: true })}
                    </div>
                ) : type === 'confirm' ? (
                    <div className="Dialog__footer">
                        {this._renderButton(tt('g.cancel'), {
                            onClick: () => this.props.onClose(),
                        })}
                        {this._renderButton(tt('g.ok'), {
                            primary: true,
                            autoFocus: true,
                        })}
                    </div>
                ) : (
                    <div className="Dialog__footer">
                        {this._renderButton(tt('g.ok'), {
                            warning: true,
                            autoFocus: true,
                        })}
                    </div>
                )}
            </form>
        );
    }

    _renderButton(text, { autoFocus, primary, warning, onClick }) {
        return (
            <div className="Dialog__footer-button-wrapper">
                <button
                    className={cn('Dialog__footer-button', {
                        'Dialog__footer-button_primary': primary,
                        'Dialog__footer-button_warning': warning,
                    })}
                    type={onClick ? 'button' : null}
                    autoFocus={autoFocus}
                    onClick={onClick}
                >
                    {text}
                </button>
            </div>
        );
    }

    _onSubmit = e => {
        e.preventDefault();
        e.stopPropagation();

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
