import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import is from 'styled-is';
import keyCodes from 'app/utils/keyCodes';

const Progress = styled.div`
    position: absolute;
    top: 10px;
    left: 0;
    width: ${({ width }) => width}%;
    height: 2px;
    border-radius: 1px;
    background: #2879ff;
`;

const HandleSlot = styled.div`
    position: relative;
    margin: 0 11px;
`;

const Handle = styled.div`
    position: absolute;
    left: ${({ left }) => left}%;
    width: 22px;
    height: 22px;
    margin-left: -11px;

    line-height: 22px;
    font-size: 11px;
    font-weight: bold;
    text-align: center;
    color: #fff;

    border: 1px solid #2879ff;
    border-radius: 50%;

    background: #2879ff;
    box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.25);

    cursor: pointer;
    transition: background-color 0.15s, border-color 0.15s;
    overflow: hidden;
`;

const Captions = styled.div`
    position: relative;
    display: flex;
    top: 32px;
    line-height: 1;
    font-size: 12px;
    color: #959595;
`;

const Caption = styled.div`
    flex: 1;

    ${is('left')`
        text-align: left;
    `}
    ${is('center')`
        text-align: center;
    `}
    ${is('right')`
        text-align: right;
    `}
`;

const Wrapper = styled.div`
    position: relative;
    height: ${({ showCaptions }) => (showCaptions ? 50 : 22)}px;
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
        ${Progress} {
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
        showCaptions: PropTypes.bool,
        hideHandleValue: PropTypes.bool,
        onChange: PropTypes.func.isRequired,
    };

    static defaultProps = {
        min: 0,
        max: 100,
        showCaptions: false,
        hideHandleValue: false,
    };

    componentWillUnmount() {
        this._removeListeners();
    }

    render() {
        const { value, min, max, hideHandleValue, showCaptions, ...passProps } = this.props;

        const percent = (100 * (value - min)) / (max - min) || 0;

        return (
            <Wrapper
                {...passProps}
                onMouseDown={this._onMouseDown}
                onClick={this._onClick}
                showCaptions={showCaptions}
            >
                <Progress width={percent} />
                <HandleSlot innerRef={this._onRef}>
                    <Handle left={percent}>{hideHandleValue ? null : value}</Handle>
                </HandleSlot>
                {showCaptions && (
                    <Captions>
                        <Caption left>0%</Caption>
                        <Caption center>50%</Caption>
                        <Caption right>100%</Caption>
                    </Captions>
                )}
            </Wrapper>
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
        this._removeListeners();
    }

    _onClick = e => {
        this.setState({
            value: this._calculateValue(e),
        });
    };

    _onMouseDown = e => {
        this.setState({
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
