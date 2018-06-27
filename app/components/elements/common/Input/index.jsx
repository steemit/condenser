import React from 'react';
import cn from 'classnames';

export default props => {
    const passProps = {...props};
    delete passProps.block;

    return (
        <input {...passProps} className={cn('Input', {
            Input_block: props.block,
        }, props.className)} />
    );
}
