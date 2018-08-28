import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import tt from 'counterpart';
import { connect } from 'react-redux';
import { Link } from 'react-router';

import { TabLink as StyledTabLink, TabLinkIndex as StyledTabLinkIndex } from 'golos-ui/Tab';
import Icon from 'golos-ui/Icon';

import Container from 'src/app/components/common/Container';
import { changeProfileLayout } from 'src/app/redux/actions/ui';
import * as ReactDOM from 'react-dom';

const Wrapper = styled.div`
    position: relative;
    min-height: 50px;
    background-color: #fff;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.15);
    z-index: 1;
    overflow-x: hidden;
`;

const TabLink = styled(StyledTabLink)`
    &.${({ activeClassName }) => activeClassName} {
        :after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: #333;
        }
    }
`;
TabLink.defaultProps = {
    activeClassName: 'active',
};

const TabLinkIndex = TabLink.withComponent(StyledTabLinkIndex);

const RightIcons = styled.div`
    display: flex;
    flex: 1;
    justify-content: flex-end;
`;

const SettingsIcon = styled(Icon)``;

const IconLink = styled(Link)`
    display: flex;
    padding: 4px;
    color: #b7b7b9;

    &.${({ activeClassName }) => activeClassName}, &:hover {
        color: #2879ff;
    }
`;
IconLink.defaultProps = {
    activeClassName: 'active',
};

const IconWrap = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 32px;
    margin-right: 15px;
    cursor: pointer;
    color: #b7b7b9;
    transition: color 0.15s;

    &:hover {
        color: #393636;
    }
`;

const SimpleIcon = styled(Icon)`
    width: 20px;
    height: 20px;
`;

const ArrowContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    width: 10px;
    height: 100%;
    position: absolute;
    top: 0;
    cursor: pointer;
    z-index: 1;
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

class UserNavigation extends PureComponent {
    constructor() {
        super();
        this.state = {
            screenLessThenMainContainer: false,
            currentOffsetIndex: 0,
        };
        this._setStyleForIconsNavigation = this._setStyleForIconsNavigation.bind(this);
        this.showNextIcon = this.showNextIcon.bind(this);
        this.showPrevIcon = this.showPrevIcon.bind(this);
    }
    static propTypes = {
        accountName: PropTypes.string,
        isOwner: PropTypes.bool,
        showLayout: PropTypes.bool,
        layout: PropTypes.oneOf(['list', 'grid']).isRequired,
        changeProfileLayout: PropTypes.func,
    };

    componentDidUpdate() {
        this._setStyleForIconsNavigation();
    }

    componentDidMount() {
        this._checkScreenSize();
        window.addEventListener('resize', this._checkScreenSize);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this._checkScreenSize);
    }

    showNextIcon(e) {
        e.stopPropagation();
        this.setState({
            currentOffsetIndex: this.state.currentOffsetIndex + 1,
        });
    }

    showPrevIcon(e) {
        e.stopPropagation();
        this.setState({
            currentOffsetIndex: this.state.currentOffsetIndex - 1,
        });
    }

    render() {
        const { accountName, isOwner, className } = this.props;

        const tabLinks = [];

        tabLinks.push({ value: tt('g.blog'), to: `/@${accountName}` });

        tabLinks.push({ value: tt('g.comments'), to: `/@${accountName}/comments` });

        if (isOwner) {
            tabLinks.push({ value: 'Избранное', to: `/@${accountName}/favorites` });
        }

        tabLinks.push(
            { value: tt('g.replies'), to: `/@${accountName}/recent-replies` },
            { value: tt('g.wallet'), to: `/@${accountName}/transfers` }
        );

        if (isOwner) {
            tabLinks.push({ value: 'Активность', to: `/@${accountName}/activity` });
        }

        const rewardsMenu = [
            {
                link: `/@${accountName}/curation-rewards`,
                value: tt('g.curation_rewards'),
            },
            {
                link: `/@${accountName}/author-rewards`,
                value: tt('g.author_rewards'),
            },
        ];
        return (
            <Wrapper className={className} innerRef={ref => (this.wrapper = ref)}>
                {this.state.currentOffsetIndex > 0 && (
                    <LeftArrowContainer onClick={this.showPrevIcon}>
                        <LeftArrow />
                    </LeftArrowContainer>
                )}
                <Container align="center" ref={ref => (this.container = ref)}>
                    {tabLinks.map(({ value, to }) => (
                        <TabLinkIndex key={to} to={to}>
                            {value}
                        </TabLinkIndex>
                    ))}
                    {/*<LinkWithDropdown*/}
                    {/*closeOnClickOutside*/}
                    {/*dropdownPosition="bottom"*/}
                    {/*dropdownContent={<VerticalMenu items={rewardsMenu} />}*/}
                    {/*>*/}
                    {/*<TabLink>{tt('g.rewards')}</TabLink>*/}
                    {/*</LinkWithDropdown>*/}
                    {this._renderRightIcons()}
                </Container>
                <RightArrowContianer
                    ref={ref => (this.rightArrow = ref)}
                    onClick={this.showNextIcon}
                >
                    <RightArrow />
                </RightArrowContianer>
            </Wrapper>
        );
    }

    _renderRightIcons() {
        const { accountName, isOwner, layout, showLayout } = this.props;

        const icons = [];

        if (showLayout && !this.state.screenLessThenMainContainer) {
            if (layout === 'list') {
                icons.push(
                    <IconWrap key="l-grid" data-tooltip="Сетка" onClick={this._onGridClick}>
                        <SimpleIcon name="layout_grid" />
                    </IconWrap>
                );
            } else {
                icons.push(
                    <IconWrap key="l-list" data-tooltip="Список" onClick={this._onListClick}>
                        <SimpleIcon name="layout_list" />
                    </IconWrap>
                );
            }
        }

        if (isOwner) {
            icons.push(
                <IconLink
                    key="settings"
                    to={`/@${accountName}/settings`}
                    data-tooltip={tt('g.settings')}
                >
                    <SettingsIcon name="setting" size="24" />
                </IconLink>
            );
        }

        if (icons.length) {
            return <RightIcons>{icons}</RightIcons>;
        }
    }

    _setStyleForIconsNavigation() {
        let container = ReactDOM.findDOMNode(this.container);
        let rightArrow = ReactDOM.findDOMNode(this.rightArrow);
        let children = container.children;
        let currentOffsetIndex = this.state.currentOffsetIndex;
        let currentOffset = children[currentOffsetIndex];

        const RIGHT_PADDING = 20;
        const LEFT_PADDING = currentOffsetIndex > 0 ? 10 : 0;
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
    }

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

    _onGridClick = () => {
        this.props.changeProfileLayout('grid');
    };

    _onListClick = () => {
        this.props.changeProfileLayout('list');
    };

    _checkScreenSize = () => {
        const wrapperWidth = this.wrapper.clientWidth;
        if (
            wrapperWidth <= this.props.MAIN_CONTAINER_WIDTH_POINT &&
            !this.state.screenLessThenMainContainer
        ) {
            this.setState({ screenLessThenMainContainer: true });
        }
        if (wrapperWidth <= this.props.MAIN_CONTAINER_WIDTH_POINT && this.props.layout !== 'grid') {
            this.props.changeProfileLayout('grid');
        }
        if (
            wrapperWidth > this.props.MAIN_CONTAINER_WIDTH_POINT &&
            this.state.screenLessThenMainContainer
        ) {
            this.setState({ screenLessThenMainContainer: false });
        }

        this._setStyleForIconsNavigation();
    };
}

export default connect(
    state => {
        const MAIN_CONTAINER_WIDTH_POINT = 1199;
        return {
            MAIN_CONTAINER_WIDTH_POINT,
            layout: (state.ui.profile && state.ui.profile.get('layout')) || 'list',
        };
    },
    {
        changeProfileLayout,
    }
)(UserNavigation);
