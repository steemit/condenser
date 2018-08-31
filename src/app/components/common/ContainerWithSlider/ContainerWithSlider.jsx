import React, { Component } from 'react';
import styled from 'styled-components';
import Container from '../Container';
import Icon from 'golos-ui/Icon';
import throttle from 'lodash/throttle';

const Wrapper = styled.div`
    position: relative;
    min-height: 50px;
    background-color: #fff;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.15);
    z-index: 1;
    overflow-x: hidden;
`;

const ArrowContainer = styled.div`
    position: absolute;
    top: 0;
    z-index: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 20px;
    height: 100%;
    cursor: pointer;
`;

const LeftArrowContainer = styled(ArrowContainer)`
    left: 20px;
`;

const RightArrowContianer = styled(ArrowContainer)`
    right: 20px;
`;

const ArrowIcon = styled(Icon)`
    width: 8px;
    height: 14px;
`;
ArrowIcon.defaultProps = {
    name: 'chevron',
};

const LeftArrow = styled(ArrowIcon)`
    transform: rotate(-90deg);
`;

const RightArrow = styled(ArrowIcon)`
    transform: rotate(90deg);
`;

class ContainerWithSlider extends Component {
    state = {
        currentOffsetIndex: 0,
    };

    componentDidUpdate() {
        this._setStyleForIconsNavigation();
    }

    componentDidMount() {
        window.addEventListener('resize', this._setStyleForIconsNavigationLazy);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this._setStyleForIconsNavigationLazy);
    }

    render() {
        const { children, className } = this.props;

        return (
            <Wrapper className={className}>
                {this.state.currentOffsetIndex > 0 && (
                    <LeftArrowContainer onClick={this._showPrevIcon}>
                        <LeftArrow />
                    </LeftArrowContainer>
                )}
                <Container align="center" innerRef={ref => (this.container = ref)}>
                    {children}
                </Container>
                <RightArrowContianer
                    innerRef={ref => (this.rightArrow = ref)}
                    onClick={this._showNextIcon}
                >
                    <RightArrow />
                </RightArrowContianer>
            </Wrapper>
        );
    }

    _showNextIcon = e => {
        e.stopPropagation();
        this.setState({
            currentOffsetIndex: this.state.currentOffsetIndex + 1,
        });
    };

    _showPrevIcon = e => {
        e.stopPropagation();
        this.setState({
            currentOffsetIndex: this.state.currentOffsetIndex - 1,
        });
    };

    _setStyleForIconsNavigation = () => {
        let container = this.container;
        let rightArrow = this.rightArrow;
        let children = container.children;
        let currentOffsetIndex = this.state.currentOffsetIndex;
        let currentOffset = children[currentOffsetIndex];

        const RIGHT_PADDING = 30;
        const LEFT_PADDING = currentOffsetIndex > 0 ? 20 : 0;
        const LEFT = children[0].offsetLeft - currentOffset.offsetLeft + LEFT_PADDING;

        rightArrow.style.display = 'none';

        if (container.clientWidth >= container.scrollWidth - LEFT) {
            this._clearStyleForIconsNavigation(children);
            return;
        }

        children[0].style.marginLeft = LEFT + 'px';

        for (let i = 0; i < children.length; i++) {
            let child = children[i];

            if (i < currentOffsetIndex) {
                child.style.opacity = 0;
                continue;
            }

            if (
                child.offsetLeft + child.clientWidth - currentOffset.offsetLeft >
                container.clientWidth - (i < children.length - 1 ? RIGHT_PADDING : 0)
            ) {
                child.style.opacity = 0;
                rightArrow.style.display = 'flex';
            } else {
                child.style.opacity = 1;
            }
        }
    };

    _setStyleForIconsNavigationLazy = throttle(this._setStyleForIconsNavigation, 50, {
        leading: false,
    });

    _clearStyleForIconsNavigation(children) {
        for (let i = 0; i < children.length; i++) {
            let child = children[i];
            if (i === 0) {
                child.style.marginLeft = 0;
            }
            child.style.opacity = 1;
        }
        if (this.state.currentOffsetIndex !== 0) {
            this.setState({
                currentOffsetIndex: 0,
            });
        }
    }
}

export default ContainerWithSlider;
