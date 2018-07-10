import React from 'react';
import cn from 'classnames';

export default class Button extends React.PureComponent {
    render() {
        const { children, primary, small, className } = this.props;

        const passProps = {
            ...this.props,
            children: undefined,
            primary: undefined,
            small: undefined,
        };

        return (
            <button
                type="button"
                {...passProps}
                className={cn(
                    'Button',
                    {
                        Button_primary: primary,
                        Button_small: small,
                    },
                    className
                )}
            >
                {children}
            </button>
        );
    }
}
