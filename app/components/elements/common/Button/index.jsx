import React from 'react';
import cn from 'classnames';

export default class Button extends React.PureComponent {
    render() {
        const { children, primary, className, disabled, onClick } = this.props;

        return (
            <button
                type="button"
                className={cn(
                    'Button',
                    {
                        Button_primary: primary,
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
