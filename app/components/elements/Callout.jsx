import React from 'react';

export default ({title, children, type}) => {
    return <div className="row">
        <div className="column">
<<<<<<< HEAD
            <div className={'callout ' + type}>
                {/* do not crate header element if not needed to avoid padding/margin styles of empty element */}
                {title ? <h4>{title}</h4> : null}
                <p>{body}</p>
=======
            <div className={'callout' + (type ? ` ${type}` : '')}>
                <h4>{title}</h4>
                <div>{children}</div>
>>>>>>> steemit/develop
            </div>
        </div>
    </div>
}
