import React from 'react';
import Icon from 'ui-patterns/components/elements/Icon.jsx';

export default function MiniHeader() {
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
