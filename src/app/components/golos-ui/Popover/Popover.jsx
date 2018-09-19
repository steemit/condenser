import React, { Component } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import throttle from 'lodash/throttle';
import is, { isNot } from 'styled-is';

const Container = styled.div`
    max-width: calc(100vw - ${({ screenMargin }) => screenMargin * 3}px);
    position: absolute;
    left: 50%;
    margin-top: 10px;
    top: 100%;
    z-index: 1;
    transform: translateX(-50%);
    cursor: default;

    ${is('up')`
        margin-top: 0;
        margin-bottom: 10px;
        top: auto;
        bottom: 100%;
    `};

    ${({ margin, screenMargin }) =>
        margin !== 0 &&
        `
            transform: translateX(calc(-50% - ${margin}px + ${screenMargin}px));
        `};

    ${isNot('isOpen')`
        height: 0;
        padding-top: 0;
        padding-bottom: 0;
        overflow: hidden;
    `};
`;

const Decoration = styled.div`
    width: 14px;
    height: 14px;
    position: absolute;
    ${({ up }) => (up ? 'bottom: -7px;' : 'top: -7px;')};
    left: 50%;
    transform: translateX(-50%) rotate(45deg);
    background-color: #ffffff;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.15);

    ${({ margin, screenMargin }) =>
        margin !== 0 &&
        `
            transform: translateX(calc(-50% + ${margin}px - ${screenMargin}px)) rotate(45deg);
        `};
`;

const ContentWrapper = styled.div`
    background-color: #ffffff;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.15);
    border-radius: 5px;
    overflow: hidden;
`;

const Content = styled.div`
    background-color: #ffffff;
    position: relative;
`;

class Popover extends Component {
    static propTypes = {
        screenMargin: PropTypes.number,
        up: PropTypes.bool,
        handleToggleOpen: PropTypes.func,
        opened: PropTypes.bool,
    };

    static defaultProps = {
        screenMargin: 20,
        up: false,
        onToggleOpen: () => {},
        opened: false,
    };

    state = {
        margin: 0,
        isOpen: this.props.opened,
    };

    componentDidMount() {
        this._checkContainerBoundingClientRect();
        window.addEventListener('resize', this._checkScreenSizeLazy);
        window.addEventListener('click', this._checkClick, true);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this._checkScreenSizeLazy);
        window.removeEventListener('click', this._checkClick, true);
        this._checkScreenSizeLazy.cancel();
    }

    render() {
        const { screenMargin, up, children, className } = this.props;
        const { margin, isOpen } = this.state;
        return (
            <Container
                className={className}
                innerRef={ref => (this.container = ref)}
                margin={margin}
                screenMargin={screenMargin}
                up={up}
                isOpen={isOpen}
            >
                <Decoration margin={margin} screenMargin={screenMargin} up={up} />
                <ContentWrapper>
                    <Content>{children}</Content>
                </ContentWrapper>
            </Container>
        );
    }

    open = () => {
        if (!this.state.isOpen) {
            this.setState({ isOpen: true });
            this.props.onToggleOpen();
        }
    };

    close = () => {
        if (this.state.isOpen) {
            this.setState({ isOpen: false });
            this.props.onToggleOpen();
        }
    };

    _checkClick = e => {
        if (this.state.isOpen && !this.container.contains(e.target)) {
            this.close();
        }
    };

    _checkContainerBoundingClientRect = () => {
        const { margin } = this.state;
        const { screenMargin } = this.props;
        const x = Math.floor(
            this.container.getBoundingClientRect().x + margin - (margin ? screenMargin : 0)
        );
        this.setState({
            margin: x < 0 ? x : 0,
        });
    };

    _checkScreenSizeLazy = throttle(this._checkContainerBoundingClientRect, 200, {
        leading: false,
    });
}

export default Popover;
