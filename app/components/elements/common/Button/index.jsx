import React from 'react';
import cn from 'classnames';

export default class Button extends React.PureComponent {
    render() {
        const { children, primary, small, className, disabled, onClick } = this.props;

        return (
            <button
                type="button"
                className={cn(
                    'Button',
                    {
                        Button_primary: primary,
                        Button_small: small,
                    },
                    className
                )}
                disabled={disabled}
                onClick={onClick}
            >
                {children}
            </button>
        );
    }
}
