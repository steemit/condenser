import React from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import Icon from 'app/components/elements/Icon';

export default class Hint extends React.PureComponent {
    static propTypes = {
        className: PropTypes.string,
        info: PropTypes.bool,
        warning: PropTypes.bool,
        align: PropTypes.oneOf(['left', 'center']),
    };

    render() {
        const {
            className,
            info,
            warning,
            children,
            align = 'center',
            innerRef,
        } = this.props;

        return (
            <div
                className={cn(
                    'Hint',
                    {
                        [`Hint_${align}`]: align,
                    },
                    className
                )}
                ref={innerRef}
            >
                <div className="Hint__content">
                    {warning ? (
                        <Icon
                            name="editor/info"
                            size="1_5x"
                            className="Hint__icon Hint__icon_warning"
                        />
                    ) : info ? (
                        <Icon
                            name="editor/info"
                            size="1_5x"
                            className="Hint__icon Hint__icon_info"
                        />
                    ) : null}
                    <div className="Hint__inner">{children}</div>
                </div>
            </div>
        );
    }
}
