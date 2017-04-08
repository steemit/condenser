import React from 'react';

class LoadingIndicator extends React.Component {

    static propTypes = {
        // html component attributes
        type: React.PropTypes.oneOf(['dots', 'circle']),
        inline: React.PropTypes.bool
    };

    constructor(props) {
        super(props);
        this.state = {progress: 0};
    }

    render() {
        const {type, inline} = this.props;
        switch (type) {
            case 'dots':
                return (
                    <div className="LoadingIndicator three-bounce">
                        <div className="bounce1"></div>
                        <div className="bounce2"></div>
                        <div className="bounce3"></div>
                    </div>
                );
            case 'circle':
                return  (
                    <div className={'LoadingIndicator circle' + (inline ? ' inline' : '')}>
                        <div></div>
                    </div>
                );
            default:
                var classes = 'LoadingIndicator loading-overlay';
                if(this.progress > 0) { classes += ' with-progress'; }
                return (
                    <div className={classes}>
                        <div className="loading-panel">
                            <div className="spinner">
                                <div className="bounce1"></div>
                                <div className="bounce2"></div>
                                <div className="bounce3"></div>
                            </div>
                            <div className="progress-indicator"><span>{this.state.progress}</span></div>
                        </div>
                    </div>
                );
        }
    }

}

export default LoadingIndicator;
