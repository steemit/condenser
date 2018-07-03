import React from 'react';
import PropTypes from 'prop-types';

import Tab from '../Tab';

const Tabs = ({ items }) => {
    return <div>
            {items.map(({ value, to, active }, key) => (
                <Tab key={key} active={active} to={to}>
                    {value}
                </Tab>
            ))}
        </div>;
};

Tabs.propTypes = {
    items: PropTypes.array,
};

Tabs.defaulProps = {
    items: [],
};

export default Tabs;
