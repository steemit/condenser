import React, { Component } from 'react';

const TabsContext = React.createContext({
    activeTab: {},
});

class TabsProvider extends Component {
    state = {
        tabs: [],
        activeTab: this.props.activeTab,
    };

    addTab = newTab => {
        for (let tab of this.state.tabs) {
            if (tab.id === newTab.id) {
                return;
            }
        }

        this.setState(state => ({
            tabs: state.tabs.concat(newTab),
        }));
    };

    removeTab = tabId => {
        this.setState(state => ({
            tabs: state.tabs.filter(tab => tab.id !== tabId),
        }));
    };

    onClick = tab => {
        this.setState(() => ({
            activeTab: tab,
        }));
    };

    render() {
        return (
            <TabsContext.Provider
                value={{
                    context: {
                        ...this.state,
                        addTab: this.addTab,
                        removeTab: this.removeTab,
                        onClick: this.onClick,
                    },
                }}
            >
                {this.props.children}
            </TabsContext.Provider>
        );
    }
}

const TabsConsumer = TabsContext.Consumer;

export { TabsProvider, TabsConsumer };
