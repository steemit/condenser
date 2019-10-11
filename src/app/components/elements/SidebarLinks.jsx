import React from 'react';
import tt from 'counterpart';

const SidebarLinks = ({ username }) => (
    <div className="c-sidebar__module">
        <div className="c-sidebar__header">
            <h3 className="c-sidebar__h3">{tt('g.links')}</h3>
        </div>
        <div className="c-sidebar__content">
            <ul className="c-sidebar__list">
                <li className="c-sidebar__list-item">
                    <a className="c-sidebar__link" href={'/@' + username}>
                        {tt('g.my_blog')}
                    </a>
                </li>
                <li className="c-sidebar__list-item">
                    <a
                        className="c-sidebar__link"
                        href={'/@' + username + '/transfers'}
                    >
                        {tt('g.my_wallet')}
                    </a>
                </li>
                <li className="c-sidebar__list-item">
                    <div style={{ color: '#aaa', paddingTop: '1em' }}>
                        My subscriptions
                    </div>
                </li>
            </ul>
        </div>
    </div>
);

export default SidebarLinks;
