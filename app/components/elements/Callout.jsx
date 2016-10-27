import React from 'react';

export default ({title, body, type = 'alert'}) => {
    return <div className="row">
        <div className="column">
            <div className={'callout ' + type}>
                {/* do not crate header element if not needed to avoid padding/margin styles of empty element */}
                {title ? <h4>{title}</h4> : null}
                <p>{body}</p>
            </div>
        </div>
    </div>
}
