import React from 'react';
import {renderToString} from 'react-dom/server';
import ServerHTML from '../server-html';
import Icon from 'app/components/elements/Icon.jsx';

export function renderPage(content, title, assets) {
    const body = renderToString(<div className="App">
        {renderHeader()}
        <br />
        <div className="row">
            {content}
        </div>
    </div>);
    const props = {body, title, assets, meta: []};
    return '<!DOCTYPE html>' + renderToString(<ServerHTML { ...props } />);
}

export function renderHeader() {
    return <header className="Header">
        <div className="Header__top header">
            <div className="expanded row">
                <div className="columns">
                    <ul className="menu">
                        <li className="Header__top-logo">
                            <a href="/"><Icon name="steem" size="2x" /></a>
                        </li>
                        <li className="Header__top-steemit show-for-medium"><a href="/">steemit<span className="beta">beta</span></a></li>
                    </ul>
                </div>
            </div>
        </div>
    </header>;
}

export function renderSignupProgressBar(steps, current) {
    const lis = steps.map((s, i) => {
        const cn = i + 1 < current ? 'done' : (i + 1 == current ? 'current' : '');
        return <li className={cn} key={i + 1}>{s}</li>
    });
    return <div className="SignupProgressBar__container expanded row">
        <div className="column">
            <div className="SignupProgressBar">
                <ul>
                    {lis}
                </ul>
            </div>
        </div>
    </div>;
}
