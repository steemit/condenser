import React from 'react';
import cn from 'classnames';

export default class Button extends React.PureComponent {
    render() {
        const { children, primary, className, onClick } = this.props;

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
                onClick={onClick}
            >
                {children}
            </button>
        );
    }
}
