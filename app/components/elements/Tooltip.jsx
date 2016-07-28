import React from 'react';
import {LinkWithTooltip} from 'react-foundation-components/lib/global/tooltip';

export default ({children, t}) => {
    //return (<LinkWithTooltip tooltipContent={t} tooltipPosition="top" tooltipIndicator={false}>
    //    {children}
    //</LinkWithTooltip>);
    return <span title={t}>{children}</span>;
}
