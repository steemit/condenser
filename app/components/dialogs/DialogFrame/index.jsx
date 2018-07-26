import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import Icon from 'golos-ui/Icon';

export default class DialogFrame extends PureComponent {
    static propTypes = {
        title: PropTypes.string,
        icon: PropTypes.string,
        className: PropTypes.string,
        buttons: PropTypes.array,
        onCloseClick: PropTypes.func.isRequired,
    };

    render() {
        const { title, icon, buttons, children, className } = this.props;

        return (
            <div className={cn('Dialog', className)}>
                <Icon name="cross" className="Dialog__close" onClick={this.props.onCloseClick} />
                {title || icon ? (
                    <div className="Dialog__header">
                        {icon ? (
                            <div className="Dialog__header-icon">
                                <Icon name={icon} size={40} />
                            </div>
                        ) : null}
                        <div className="Dialog__title">{title}</div>
                    </div>
                ) : null}
                <div className="Dialog__content">{children}</div>
                {buttons && buttons.length ? (
                    <div className="Dialog__footer">{buttons.map(this._renderButton)}</div>
                ) : null}
            </div>
        );
    }

    _renderButton = ({ text, autoFocus, primary, warning, onClick }, index) => {
        return (
            <div className="Dialog__footer-button-wrapper" key={index}>
                <button
                    className={cn('Dialog__footer-button', {
                        'Dialog__footer-button_primary': primary,
                        'Dialog__footer-button_warning': warning,
                    })}
                    type="button"
                    autoFocus={autoFocus}
                    onClick={onClick}
                >
                    {text}
                </button>
            </div>
        );
    };
}
