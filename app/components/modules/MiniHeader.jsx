import React from 'react';
import Icon from 'app/components/elements/Icon.jsx';
import { APP_NAME, APP_ICON } from 'config/client_config';

export default function MiniHeader() {
    return <header className="Header">
        <div className="Header__top header">
            <div className="expanded row">
                <div className="columns">
                    <ul className="menu">
                        <li className="Header__top-logo">
                            <a href="/"><Icon name={APP_ICON} size="2x" /></a>
                        </li>
                        <li className="Header__top-steemit show-for-medium"><a href="/">{APP_NAME}</a></li>
                    </ul>
                </div>
            </div>
        </div>
    </header>;
}
