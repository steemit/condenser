import React from 'react';

export default ({title, children, type}) => {
    return <div className="row">
        <div className="column">
            <div className={'callout' + (type ? ` ${type}` : '')}>
                {title && <h4>{title}</h4>}
                {children && <div>{children}</div> || <span/>}
            </div>
        </div>
    </div>
}
