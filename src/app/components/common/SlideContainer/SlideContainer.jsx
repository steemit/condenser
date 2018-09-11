import React, { PureComponent } from 'react';
import styled from 'styled-components';
import is from 'styled-is';
import throttle from 'lodash/throttle';
import Icon from 'golos-ui/Icon';
import Container from '../Container';

const SHIFT_SPEED = 0.7;
const SHIFT_AMOUNT = 150;

const Root = styled.div`
    position: relative;
    height: 50px;
    background: #fff;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.15);
    overflow: hidden;

    ${is('leftshade')`
        &:before {
            position: absolute;
            content: '';
            left: 0;
            top: 0;
            bottom: 0;
            width: 80px;
            background: linear-gradient(to right, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0));
            z-index: 1;
        }
    `};

    ${is('rightshade')`
        &:after {
            position: absolute;
            content: '';
            right: 0;
            top: 0;
            bottom: 0;
            width: 80px;
            background: linear-gradient(to left, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0));
            z-index: 1;
        }
    `};
`;

const Wrapper = styled(Container)`
    position: relative;
    display: block;
    overflow-x: auto;
    overflow-y: hidden;
`;

const Content = styled.div`
    display: flex;
    align-items: center;
`;

const ArrowContainer = styled.div`
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    top: 0;
    bottom: 0;
    width: 50px;
    cursor: pointer;
    z-index: 2;
`;

const LeftArrowContainer = styled(ArrowContainer)`
    left: 0;
`;

const RightArrowContainer = styled(ArrowContainer)`
    right: 0;
`;

const ArrowIcon = styled(Icon).attrs({
    name: 'chevron',
})`
    width: 14px;
`;

const LeftArrow = styled(ArrowIcon)`
    transform: rotate(-90deg);
`;

const RightArrow = styled(ArrowIcon)`
    transform: rotate(90deg);
`;

class SlideContainer extends PureComponent {
    state = {
        currentOffsetIndex: 0,
    };

    componentDidMount() {
        window.addEventListener('resize', this._renderLazy);
        this._renderLazy();
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this._renderLazy);
        this._renderLazy.cancel();
    }

    render() {
        const { children, className } = this.props;
        const { contentWidth, scrollLeft, width } = this.state;

        let left = false;
        let right = false;

        if (this._content) {
            left = scrollLeft !== 0;
            right = width > scrollLeft + contentWidth;
        }

        return (
            <Root className={className} leftshade={left} rightshade={right}>
                {left ? (
                    <LeftArrowContainer onClick={this._onLeftClick}>
                        <LeftArrow />
                    </LeftArrowContainer>
                ) : null}
                <Wrapper innerRef={this._onWrapperRef} onScroll={this._renderLazy}>
                    <Content innerRef={this._onContentRef}>{children}</Content>
                </Wrapper>
                {right ? (
                    <RightArrowContainer onClick={this._onRightClick}>
                        <RightArrow />
                    </RightArrowContainer>
                ) : null}
            </Root>
        );
    }

    _onWrapperRef = el => {
        this._wrapper = el;
    };

    _onContentRef = el => {
        this._content = el;
    };

    _onLeftClick = () => {
        this._scroll(SHIFT_AMOUNT, true);
    };

    _onRightClick = () => {
        this._scroll(SHIFT_AMOUNT);
    };

    _scroll = (px, left) => {
        this._stepTs = Date.now() - 16;
        this._step(px, left);
    };

    _step = (px, left) => {
        const now = Date.now();
        const delta = now - this._stepTs;
        this._stepTs = now;

        const shift = Math.round(delta * SHIFT_SPEED);

        if (left) {
            this._wrapper.scrollLeft -= Math.min(px, shift);
        } else {
            this._wrapper.scrollLeft += Math.min(px, shift);
        }

        const remain = px - shift;

        if (remain > 0) {
            nextAnimationFrame(() => {
                this._step(remain, left);
            });
        }
    };

    _renderLazy = throttle(
        () => {
            this.setState({
                contentWidth: this._content.offsetWidth,
                scrollLeft: this._wrapper.scrollLeft,
                width: this._wrapper.scrollWidth,
            });
        },
        50,
        { leading: false }
    );
}

function nextAnimationFrame(callback) {
    if (window.requestAnimationFrame) {
        window.requestAnimationFrame(callback);
    } else {
        setTimeout(() => callback(), 16);
    }
}

export default SlideContainer;
