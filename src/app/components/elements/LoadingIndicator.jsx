import React from 'react';
import PropTypes from 'prop-types';

class LoadingIndicator extends React.Component {
    static propTypes = {
        // html component attributes
        type: PropTypes.oneOf(['dots', 'circle', 'circle-strong']),
        inline: PropTypes.bool,
        style: PropTypes.object,
    };

    static defaultProps = {
        style: {},
    };

    constructor(props) {
        super(props);
        this.state = { progress: 0 };
    }

    render() {
        const { type, inline, style } = this.props;
        switch (type) {
            case 'dots':
                return (
                    <div
                        style={style}
                        className="LoadingIndicator three-bounce"
                    >
                        <div className="bounce1" />
                        <div className="bounce2" />
                        <div className="bounce3" />
                    </div>
                );
            case 'circle':
                return (
                    <div
                        style={style}
                        className={
                            'LoadingIndicator circle' +
                            (inline ? ' inline' : '')
                        }
                    >
                        <div />
                    </div>
                );
            //'strong' may be an evolving load indicator.
            case 'circle-strong':
                return (
                    <div
                        style={style}
                        className={'LoadingIndicator circle circle-strong'}
                    >
                        <div />
                    </div>
                );
            default:
                return (
                    <div
                        className={
                            'LoadingIndicator loading-overlay' +
                            (this.progress > 0 ? ' with-progress' : '')
                        }
                        style={style}
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

export default LoadingIndicator;
