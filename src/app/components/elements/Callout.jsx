import React from 'react';

export default ({ title, children, type }) => {
    return (
        <div className="row">
            <div className="column">
                <div className={'callout' + (type ? ` ${type}` : '')}>
                    <h4>{title}</h4>
                    <div>{children}</div>
                </div>
            </div>
        </div>
    );
};
