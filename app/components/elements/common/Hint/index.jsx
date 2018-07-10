import React from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import Icon from 'app/components/elements/Icon';

export default class Hint extends React.PureComponent {
    static propTypes = {
        className: PropTypes.string,
        info: PropTypes.bool,
        error: PropTypes.bool,
        warning: PropTypes.bool,
        width: PropTypes.number,
        align: PropTypes.oneOf(['left', 'center', 'right']),
    };

    constructor(props) {
        super(props);

        this.state = {
            align: 'center',
            alignCalculation: !props.align,
        };
    }

    componentDidMount() {
        if (this.state.alignCalculation) {
            const box = this.refs.root.getBoundingClientRect();

            let align = 'center';

            if (
                box.x + box.width / 2 - window.scrollX >
                window.innerWidth - 150
            ) {
                align = 'right';
            } else if (box.x - box.width / 2 - window.scrollX < 150) {
                align = 'left';
            }

            this.setState({
                alignCalculation: false,
                align,
            });
        }
    }

    render() {
        if (this.state.alignCalculation) {
            return <div ref="root" />;
        }

        const {
            className,
            info,
            error,
            warning,
            width,
            children,
            innerRef,
        } = this.props;

        const align = this.props.align || this.state.align;

        let icon = 'Hint__icon';

        if (warning) {
            icon += ' Hint__icon_warning';
        } else if (error) {
            icon += ' Hint__icon_error';
        } else if (info) {
            icon += ' Hint__icon_info';
        } else {
            icon = null;
        }

        let contentStyle;

        if (width) {
            contentStyle = { width, maxWidth: 'unset' };
        }

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
                <div className="Hint__content" style={contentStyle}>
                    {icon ? (
                        <Icon name="editor/info" size="1_5x" className={icon} />
                    ) : null}
                    <div className="Hint__inner">{children}</div>
                </div>
            </div>
        );
    }
}
