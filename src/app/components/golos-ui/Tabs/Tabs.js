import React, { Fragment, Component } from 'react';
import styled from 'styled-components';

import { TabsConsumer, TabsProvider } from './TabsContext';

import { default as StyledTab } from 'golos-ui/Tab';

const TabsList = styled.ul`
    padding-left: 0;
    margin: 0;
    list-style: none;
`;

const activeStyles = `
    transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
    cursor: default;
`;

const TabTitleItem = styled(StyledTab)`
    transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;

    ${({ active }) => active && activeStyles}
    &.${({ activeClassName }) => activeClassName} {
        {activeStyles}
    };
`;
TabTitleItem.defaultProps = {
    activeClassName: 'active',
};

const TabActiveBorder = styled.div`
    position: absolute;
    bottom: -1px;
    transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
    will-change: left, width;

    ${({ activeTab }) =>
        activeTab &&
        `
            width: ${activeTab.offsetWidth}px;
            left: ${activeTab.offsetLeft}px;
    `};

    &:after,
    &:before {
        bottom: 100%;
        left: 50%;
        border: solid transparent;
        content: ' ';
        height: 0;
        width: 0;
        position: absolute;
        pointer-events: none;
    }

    &:after {
        border-color: rgba(255, 255, 255, 0);
        border-bottom-color: #ffffff;
        border-width: 5px;
        margin-left: -5px;
    }
    &:before {
        border-color: rgba(233, 233, 233, 0);
        border-bottom-color: #e9e9e9;
        border-width: 6px;
        margin-left: -6px;
    }
`;

const TabsContainer = styled.div`
    position: relative;
    padding: 0 14px;
    border-bottom: 1px solid #e9e9e9;
    user-select: none;
`;

class Tabs extends Component {
    static defaultProps = {
        onChange: () => {}
    };

    state = {
        tabsElements: [],
    };

    setTabRef = (ref, tab) => {
        const { tabsElements } = this.state;

        if (!tabsElements[tab.id]) {
            tabsElements[tab.id] = ref;

            this.setState({ tabsElements });
        }
    };

    renderTabsList = context => {
        return context.tabs.map((tab, index) => (
            <TabTitleItem
                key={index}
                onClick={this.onClick(context, tab)}
                id={tab.id}
                innerRef={ref => this.setTabRef(ref, tab)}
                active={context.activeTab.id === tab.id}
            >
                {tab.title}
            </TabTitleItem>
        ));
    };

    onClick = (context, tab) => () => {
        this.props.onChange(tab);
        context.onClick(tab);
    };

    render() {
        const { activeTab, children } = this.props;
        const { tabsElements } = this.state;

        return (
            <TabsProvider activeTab={activeTab}>
                <TabsConsumer>
                    {({ context }) => (
                        <Fragment>
                            <TabsContainer>
                                <TabsList>{this.renderTabsList(context)}</TabsList>
                                <TabActiveBorder activeTab={tabsElements[context.activeTab.id]} />
                            </TabsContainer>

                            {children}
                        </Fragment>
                    )}
                </TabsConsumer>
            </TabsProvider>
        );
    }
}

export default Tabs;
