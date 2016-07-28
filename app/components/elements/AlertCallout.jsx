import React from 'react';

export default ({title, body}) => {
    return <div className="row">
        <div className="column">
            <div className="callout alert">
                <h4>{title}</h4>
                <p>{body}</p>
            </div>
        </div>
    </div>
}
