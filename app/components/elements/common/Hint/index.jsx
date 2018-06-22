import React from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import Icon from 'app/components/elements/Icon';

export default class Hint extends React.PureComponent {
    static propTypes = {
        className: PropTypes.string,
        info: PropTypes.bool,
        warning: PropTypes.bool,
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

            if ((box.x + box.width / 2) - window.scrollX > window.innerWidth - 150) {
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
            warning,
            children,
            innerRef,
        } = this.props;

        const align = this.props.align || this.state.align;

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
