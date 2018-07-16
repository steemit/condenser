import React, { Component } from 'react';
import styled from 'styled-components';
import is from 'styled-is';

import { TabsConsumer, TabsProvider } from './TabsContext';
import Tab from './Tab';

import { default as StyledTab } from 'golos-ui/Tab';

const TabsList = styled.ul`
    padding-left: 0;
    list-style: none;
    margin: 0;
`;

const activeStyles = `
    transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
    cursor: default;
`;

const TabTitleItem = styled(StyledTab)`
    transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
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
    bottom: 0;
    transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
    will-change: left, width;

    ${({ activeTab }) =>
        activeTab &&
        `
            width: ${activeTab.offsetWidth}px;
            left: ${activeTab.offsetLeft}px;
    `};

    &:after,
    &:before {
        top: 100%;
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
        border-top-color: #ffffff;
        border-width: 7px;
        margin-left: -7px;
    }
    &:before {
        border-color: rgba(233, 233, 233, 0);
        border-top-color: #e9e9e9;
        border-width: 8px;
        margin-left: -8px;
    }
`;

const TabsContainer = styled.div`
    position: relative;
    border-bottom: 1px solid #e9e9e9;
`;

const ReactTabs = styled.div`
    position: realative;
`;

class Tabs extends Component {
    static Tab = Tab;

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
                onClick={context.onClick(tab)}
                id={tab.id}
                innerRef={ref => this.setTabRef(ref, tab)}
                active={context.activeTab.id === tab.id}
            >
                {tab.title}
            </TabTitleItem>
        ));
    };

    render() {
        const { activeTab, children } = this.props;
        const { tabsElements } = this.state;

        console.log(tabsElements);

        return (
            <TabsProvider activeTab={activeTab}>
                <TabsConsumer>
                    {({ context }) => (
                        <ReactTabs>
                            <TabsContainer>
                                <TabsList>{this.renderTabsList(context)}</TabsList>
                                <TabActiveBorder activeTab={tabsElements[context.activeTab.id]} />
                            </TabsContainer>

                            {children}
                        </ReactTabs>
                    )}
                </TabsConsumer>
            </TabsProvider>
        );
    }
}

export default Tabs;
