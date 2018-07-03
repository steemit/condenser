import React from 'react';
import Icon from 'app/components/elements/Icon';

export default class HintIcon extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            isShow: false,
        };
    }

    componentWillUnmount() {
        this._unmount = true;
        window.removeEventListener('mousedown', this._onAwayClick);
    }

    render() {
        const { isShow } = this.state;

        return (
            <div className="HintIcon">
                <Icon
                    name="editor/info"
                    className="HintIcon__icon"
                    onClick={this._onClick}
                />
                {isShow ? this._renderHint() : null}
            </div>
        );
    }

    _renderHint() {
        return (
            <div className="HintIcon__bubble" ref="bubble">
                <Icon className="HintIcon__close" name="cross" onClick={this._onCloseClick} />
                <span className="HintIcon__text">{this.props.hint}</span>
            </div>
        );
    }

    _onClick = e => {
        e.preventDefault();

        this._toggleHint(true);
    };

    _onAwayClick = e => {
        if (!this.refs.bubble.contains(e.target)) {
            setTimeout(() => {
                if (!this._unmount) {
                    this._toggleHint(false);
                }
            }, 50);
        }
    };

    _onCloseClick = () => {
        this._toggleHint(false);
    };

    _toggleHint(enable) {
        if (enable) {
            this.setState({
                isShow: true,
            });
            window.addEventListener('mousedown', this._onAwayClick);
        } else {
            this.setState({
                isShow: false,
            });
            window.removeEventListener('mousedown', this._onAwayClick);
        }
    }
}
