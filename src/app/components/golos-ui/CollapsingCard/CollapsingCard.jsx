import React, { PureComponent } from 'react';
import styled from 'styled-components';
import is from 'styled-is';
import Icon from 'golos-ui/Icon';

const Root = styled.div`
    margin-bottom: 18px;
    border-radius: 8px;
    background: #fff;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.06);
`;

const Header = styled.div`
    display: flex;
    align-items: center;
    height: 50px;
    padding: 0 20px;
    font-size: 14px;
    font-weight: 500;
    text-transform: uppercase;
    color: #393636;
    user-select: none;
`;

const HeaderTitle = styled.div`
    white-space: nowrap;
    flex-grow: 1;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const CollapseIcon = Icon.extend`
    width: 32px;
    height: 32px;
    padding: 9px;
    margin-right: -8px;
    cursor: pointer;
    transform: rotate(0);
    transition: transform 0.4s;

    &:hover {
        color: #000;
    }

    ${is('flip')`
        transform: rotate(0.5turn);
    `};
`;

const BodyWrapper = styled.div`
    overflow: hidden;

    ${is('animated')`
        transition: height 0.5s;
    `};
`;

const Body = styled.div`
    border-top: 1px solid #e9e9e9;
`;

export default class CollapsingCard extends PureComponent {
    state = {
        collapsed: false,
        animated: false,
    };

    componentWillUnmount() {
        clearTimeout(this._animationOffTimeout);
    }

    render() {
        const { title, children } = this.props;
        const { collapsed, height, animated } = this.state;

        return (
            <Root innerRef={this._onRootRef}>
                <Header>
                    <HeaderTitle>{title}</HeaderTitle>
                    <CollapseIcon
                        name="chevron"
                        flip={collapsed ? 1 : 0}
                        onClick={this._onCollapseClick}
                    />
                </Header>
                <BodyWrapper
                    animated={animated}
                    style={{
                        height: height || (collapsed ? 0 : null),
                    }}
                >
                    <Body innerRef={this._onBodyRef}>{children}</Body>
                </BodyWrapper>
            </Root>
        );
    }

    _onRootRef = el => {
        this._root = el;
    };

    _onBodyRef = el => {
        this._body = el;
    };

    _onCollapseClick = () => {
        const { collapsed } = this.state;

        clearTimeout(this._animationOffTimeout);

        if (collapsed) {
            this.setState({
                collapsed: false,
                height: this._body.scrollHeight,
                animated: true,
            });

            this._animationOffTimeout = setTimeout(() => {
                this.setState({
                    height: null,
                    animated: false,
                });
            }, 600);
        } else {
            this.setState(
                {
                    collapsed: true,
                    height: this._body.scrollHeight,
                    animation: false,
                },
                () => {
                    // Triggers dom reflow
                    const forceCss = this._root.clientHeight;

                    this.setState({
                        height: 0,
                        animated: true,
                    });

                    this._animationOffTimeout = setTimeout(() => {
                        this.setState({
                            height: null,
                            animated: false,
                        });
                    }, 600);
                }
            );
        }
    };
}
