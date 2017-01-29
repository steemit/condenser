import React from 'react';
import { translate } from 'app/Translator';

export default ({value}) => {
    if (isNaN(value)) {
        console.log("Unexpected rep value:", value);
        return null;
    }
    return <span className="Reputation" title={translate('reputation')}>{value}</span>;
}
