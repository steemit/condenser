import React, { Component } from 'react';
import { TabsConsumer } from './TabsContext';

class TabContainer extends Component {
    render() {
        const { id, title, children } = this.props;

        return (
            <TabsConsumer>
                {value => {
                    value.context.addTab({ id, title });
                    return value.context.activeTab.id === id && children;
                }}
            </TabsConsumer>
        );
    }
}

export default TabContainer;
