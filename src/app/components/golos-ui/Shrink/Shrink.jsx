import React, { PureComponent } from 'react';
import styled from 'styled-components';
import is from 'styled-is';
import Icon from '../Icon';

const Root = styled.div``;

const SubHeaderShrink = styled.div`
    position: relative;
    overflow: hidden;
    transition: height 0.25s;

    ${is('shrink')`
        &:after {
            position: absolute;
            content: '';
            bottom: 0;
            left: 0;
            right: 0;
            height: 20px;
            background: linear-gradient(rgba(255, 255, 255, 0), rgba(255, 255, 255, 1));
            pointer-events: none;
        }
    `};
`;

const SubHeaderCollapse = styled.div`
    display: flex;
    justify-content: center;
`;

const CollapseIcon = Icon.extend`
    width: 60px;
    height: 20px;
    padding: 5px;
    color: #c3c2c2;
    cursor: pointer;
    transform: rotate(0);
    transition: transform 0.25s, color 0.15s;

    ${is('active')`
        transform: rotate(0.5turn);
    `};

    &:hover {
        color: #333;
    }
`;

export default class Shrink extends PureComponent {
    state = {
        shrink: true,
    };

    render() {
        const { children, height } = this.props;
        const { shrink } = this.state;

        const allowShrink = this._contentHeight != null && height < this._contentHeight;

        let realHeight;

        if (this._contentHeight == null || (shrink && allowShrink)) {
            realHeight = height;
        } else {
            realHeight = this._contentHeight;
        }

        const realShrink = allowShrink && shrink;

        return (
            <Root>
                <SubHeaderShrink shrink={realShrink} style={{ height: realHeight }}>
                    <div ref={this._onContentRef}>{children}</div>
                </SubHeaderShrink>
                {allowShrink ? (
                    <SubHeaderCollapse>
                        <CollapseIcon
                            name="chevron"
                            active={realShrink ? 1 : 0}
                            onClick={this._onCollapseClick}
                        />
                    </SubHeaderCollapse>
                ) : null}
            </Root>
        );
    }

    _onContentRef = el => {
        if (el) {
            this._contentHeight = el.offsetHeight;
            this.forceUpdate();
        }
    };

    _onCollapseClick = () => {
        this.setState({
            shrink: !this.state.shrink,
        });
    };
}
