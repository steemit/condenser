import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';

export default class LoadingIndicator extends PureComponent {
    static propTypes = {
        type: PropTypes.oneOf(['dots', 'circle', 'little']),
        center: PropTypes.bool,
        inline: PropTypes.bool,
        size: PropTypes.number,
    };

    state = { progress: 0 };

    render() {
        const { type, inline, size, center } = this.props;

        const style = {};

        if (size) {
            style.width = size;
            style.height = size;
        }

        const rootClass = 'LoadingIndicator' + (center ? ' LoadingIndicator_center' : '');

        switch (type) {
            case 'dots':
                return (
                    <div className={`${rootClass} three-bounce`}>
                        <div className="bounce1" />
                        <div className="bounce2" />
                        <div className="bounce3" />
                    </div>
                );
            case 'circle':
                return (
                    <div className={`${rootClass} circle ${inline ? 'inline' : ''}`}>
                        <div style={style} />
                    </div>
                );
            case 'little':
                return (
                    <div className={`${rootClass} circle little ${inline ? 'inline' : ''}`}>
                        <div style={style} />
                    </div>
                );
            default:
                return (
                    <div
                        className={cn(rootClass, 'loading-overlay', {
                            'with-progress': this.progress > 0,
                        })}
                    >
                        <div className="loading-panel">
                            <div className="spinner">
                                <div className="bounce1" />
                                <div className="bounce2" />
                                <div className="bounce3" />
                            </div>
                            <div className="progress-indicator">
                                <span>{this.state.progress}</span>
                            </div>
                        </div>
                    </div>
                );
        }
    }
}
