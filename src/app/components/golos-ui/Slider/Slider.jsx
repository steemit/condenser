import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import is from 'styled-is';
import keyCodes from 'app/utils/keyCodes';

const HandleSlot = styled.div`
    position: relative;
    margin: 0 10px;
`;

const Handle = styled.div`
    position: absolute;
    left: 0;
    width: 22px;
    height: 22px;
    margin-left: -11px;
    border: 1px solid #2879ff;
    border-radius: 50%;
    line-height: 22px;
    font-size: 11px;
    font-weight: bold;
    text-align: center;
    color: #fff;
    background: #2879ff;
    cursor: pointer;
    transition: background-color 0.15s, border-color 0.15s;
    overflow: hidden;

    &:hover {
        background: #5191ff;
        border-color: #5191ff;
    }

    ${is('active')`
        background: #2879ff !important;
        border-color: #2879ff !important;
    `};
`;

const Filler = styled.div`
    position: absolute;
    top: 10px;
    left: 0;
    width: 0;
    height: 2px;
    border-radius: 1px;
    background: #2879ff;
`;

const Root = styled.div`
    position: relative;
    height: 22px;
    user-select: none;
    cursor: pointer;

    &:before {
        position: absolute;
        content: '';
        top: 10px;
        left: 0;
        right: 0;
        height: 2px;
        border-radius: 1px;
        background: #e1e1e1;
    }

    ${is('red')`
        ${Filler} {
            background: #ff4e00;
        }
        
        ${Handle} {
            background: #ff4e00 !important;
            border-color: #ff4e00 !important;
        }
    `};
`;

export default class Slider extends PureComponent {
    static propTypes = {
        value: PropTypes.number.isRequired,
        min: PropTypes.number,
        max: PropTypes.number,
        red: PropTypes.bool,
        onChange: PropTypes.func.isRequired,
    };

    static defaultProps = {
        min: 0,
        max: 100,
    };

    state = {
        active: false,
    };

    componentWillUnmount() {
        this._removeListeners();
    }

    render() {
        const { value, min, max, ...passProps } = this.props;
        const { active } = this.state;

        const percent = (100 * (value - min)) / (max - min);

        return (
            <Root {...passProps} onMouseDown={this._onMouseDown} onClick={this._onClick}>
                <Filler style={{ width: `${percent}%` }} />
                <HandleSlot innerRef={this._onRef}>
                    <Handle active={active} style={{ left: `${percent}%` }}>
                        {value}
                    </Handle>
                </HandleSlot>
            </Root>
        );
    }

    _onRef = el => {
        this._root = el;
    };

    _removeListeners() {
        if (this._isListenerActive) {
            this._isListenerActive = false;
            window.removeEventListener('mousemove', this._onMouseMove);
            window.removeEventListener('mouseup', this._onMouseUp);
            window.removeEventListener('keydown', this._onKeyDown);
            window.removeEventListener('visibilitychange', this._onVisibilityChange);
        }
    }

    _calculateValue(e) {
        const { min, max } = this.props;
        const box = this._root.getBoundingClientRect();

        const unbound = Math.round(((max - min) * (e.clientX - box.left)) / box.width);

        return Math.min(max, Math.max(min, unbound));
    }

    _resetMoving() {
        this.setState({
            active: false,
        });

        this._removeListeners();
    }

    _onClick = e => {
        this.setState({
            value: this._calculateValue(e),
        });
    }

    _onMouseDown = e => {
        e.preventDefault();

        this.setState({
            active: true,
            value: this._calculateValue(e),
        });

        if (!this._isListenerActive) {
            this._isListenerActive = true;
            window.addEventListener('mousemove', this._onMouseMove);
            window.addEventListener('mouseup', this._onMouseUp);
            window.addEventListener('keydown', this._onKeyDown);
            window.addEventListener('visibilitychange', this._onVisibilityChange);
        }
    };

    _onMouseMove = e => {
        this.props.onChange(this._calculateValue(e));
    };

    _onMouseUp = e => {
        this._resetMoving();

        this.props.onChange(this._calculateValue(e));
    };

    _onKeyDown = e => {
        if (e.which === keyCodes.ESCAPE) {
            this._resetMoving();
        }
    };

    _onVisibilityChange = () => {
        if (document.hidden) {
            this._resetMoving();
        }
    };
}
