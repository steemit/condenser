import React from 'react';

const SidebarStats = ({ steemPower, followers, reputation }) => (
    <div className="c-sidebar__module">
        <div className="c-sidebar__header">
            <h3 className="c-sidebar__h3">Stats</h3>
        </div>
        <div className="c-sidebar__content">
            <ul className="c-sidebar__list">
                <li className="c-sidebar__list-item">
                    <span className="c-sidebar__label">Steem Power</span>
                    <span className="c-sidebar__score">{steemPower}</span>
                </li>
                <li className="c-sidebar__list-item">
                    <span className="c-sidebar__label">Followers</span>
                    <span className="c-sidebar__score">{followers}</span>
                </li>
                <li className="c-sidebar__list-item">
                    <span className="c-sidebar__label">Reputation</span>
                    <span className="c-sidebar__score">{reputation}</span>
                </li>
            </ul>
        </div>
    </div>
);

export default SidebarStats;
