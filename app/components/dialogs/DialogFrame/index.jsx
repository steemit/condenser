import React from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import Icon from 'app/components/elements/Icon';

export default class Dialog extends React.PureComponent {
    static propTypes = {
        title: PropTypes.string,
        className: PropTypes.string,
        buttons: PropTypes.array,
        onCloseClick: PropTypes.func.isRequired,
    };

    render() {
        const { title, buttons, children, className } = this.props;

        return (
            <div className={cn('Dialog', className)}>
                <Icon
                    name="cross"
                    className="Dialog__close"
                    onClick={this.props.onCloseClick}
                />
                {title ? <div className="Dialog__header">{title}</div> : null}
                <div className="Dialog__content">{children}</div>
                {buttons && buttons.length ? (
                    <div className="Dialog__footer">
                        {buttons.map(this._renderButton)}
                    </div>
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
