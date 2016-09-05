import React from 'react';

export default ({title, body, type = 'alert'}) => {
    return <div className="row">
        <div className="column">
            <div className={'callout ' + type}>
                <h4>{title}</h4>
                <p>{body}</p>
            </div>
        </div>
    </div>
}
