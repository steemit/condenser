import React, { PureComponent } from 'react';
import styled from 'styled-components';
import is from 'styled-is';
import Icon from 'golos-ui/Icon';

const IconStyled = styled(Icon)`
    flex-shrink: 0;
    margin-top: 17px;
    margin-left: 3px;
    color: #aaa;
    cursor: pointer;
    transform: rotate(0.5turn);
    transition: color 0.15s, transform 0.2s;
    will-change: color, transform;

    ${is('open')`
        transform: rotate(1turn);
    `};

    &:hover {
        color: #333;
    }
`;

const Root = styled.div`
    display: flex;
    align-items: flex-start;
    box-sizing: content-box;
    transition: height 0.25s;
    will-change: height;
    overflow: hidden;

    ${is('closed')`
        cursor: pointer;

        &:hover ${IconStyled} {
            color: #333;
        }
    `}
`;

export default class TextCut extends PureComponent {
    state = {
        withCut: false,
        open: false,
    };

    render() {
        const { className, height, children } = this.props;
        const { withCut, open } = this.state;

        const closed = withCut && !open;

        return (
            <Root
                className={className}
                closed={closed}
                style={{
                    height: open ? this._contentHeight : height,
                }}
                onClick={closed ? this._onClick : null}
            >
                <div ref={this._onRef}>{children}</div>
                {withCut ? (
                    <IconStyled
                        name="chevron"
                        size={16}
                        open={open ? 1 : 0}
                        onClick={this._onToggleClick}
                    />
                ) : null}
            </Root>
        );
    }

    _onRef = el => {
        if (el) {
            this._contentHeight = el.clientHeight;

            if (this._contentHeight > this.props.height) {
                this.setState({
                    withCut: true,
                });
            }
        }
    };

    _onToggleClick = () => {
        this.setState({
            open: !this.state.open,
        });
    };

    _onClick = () => {
        this._onToggleClick();
    };
}
