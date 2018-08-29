import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import is from 'styled-is';
import Icon from 'golos-ui/Icon';

const Root = styled.div``;

const Header = styled.div`
    display: flex;
    align-items: center;
    height: 50px;
    padding: 0 20px;
    font-size: 14px;
    font-weight: 500;
    color: #393636;
    cursor: pointer;
    user-select: none;
`;

const HeaderTitle = styled.div`
    white-space: nowrap;
    flex-grow: 1;
    overflow: hidden;
    text-overflow: ellipsis;

    ${is('upper')`
        text-transform: uppercase;
    `}
`;

const CollapseIcon = Icon.extend`
    width: 32px;
    height: 32px;
    padding: 9px;
    margin-right: -8px;
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

const Body = styled.div``;

export default class CollapsingBlock extends PureComponent {
    static propTypes = {
        title: PropTypes.any.isRequired,
        initialCollapsed: PropTypes.bool,
        saveStateKey: PropTypes.string,
    };

    constructor(props) {
        super(props);

        let collapsed;

        if (props.saveStateKey) {
            collapsed = getState(props.saveStateKey);
        }

        if (collapsed == null && props.initialCollapsed) {
            collapsed = props.initialCollapsed;
        }

        if (collapsed == null) {
            collapsed = false;
        }

        this.state = {
            collapsed,
            animated: false,
        };
    }

    componentWillUnmount() {
        clearTimeout(this._animationOffTimeout);
    }

    render() {
        const { title, children, upperCase, className } = this.props;
        const { collapsed, height, animated } = this.state;

        return <Root innerRef={this._onRootRef} className={className}>
                <Header onClick={this._onCollapseClick}>
                    <HeaderTitle upper={upperCase}>
                        {typeof title === 'function' ? title() : title}
                    </HeaderTitle>
                    <CollapseIcon name="chevron" flip={collapsed ? 1 : 0} />
                </Header>
                <BodyWrapper animated={animated} style={{ height: height || (collapsed ? 0 : null) }}>
                    <Body innerRef={this._onBodyRef}>{children}</Body>
                </BodyWrapper>
            </Root>;
    }

    _onRootRef = el => {
        this._root = el;
    };

    _onBodyRef = el => {
        this._body = el;
    };

    _onCollapseClick = () => {
        const { saveStateKey } = this.props;
        const { collapsed } = this.state;

        if (saveStateKey) {
            try {
                setState(saveStateKey, !collapsed);
            } catch (err) {}
        }

        clearTimeout(this._animationOffTimeout);

        if (collapsed) {
            this.setState({
                collapsed: false,
                height: this._body.offsetHeight,
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
                    height: this._body.offsetHeight,
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

function getState(key) {
    if (process.env.BROWSER) {
        const value = localStorage.getItem(`golos.collapse.${key}`);

        if (value != null) {
            return value === '1';
        } else {
            return null;
        }
    } else {
        return null;
    }
}

function setState(key, state) {
    const fullKey = `golos.collapse.${key}`;

    localStorage.setItem(fullKey, state ? '1' : '0');
}
