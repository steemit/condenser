import React from 'react';
import { SIGNUP_URL } from 'shared/constants';
import tt from 'counterpart';

const SidebarNewUsers = () => (
    <div className="c-sidebar__module">
        <div className="c-sidebar__header">
            <h3 className="c-sidebar__h3">
                {tt('sidebarnewusers_jsx.new_to_steemit')}
            </h3>
        </div>
        <div className="c-sidebar__content">
            <ul className="c-sidebar__list">
                <li className="c-sidebar__list-item">
                    <a className="c-sidebar__link" href="/welcome">
                        {tt('sidebarnewusers_jsx.quick_start_guide')}
                    </a>
                </li>
                <li className="c-sidebar__list-item">
                    <a className="c-sidebar__link" href="https://steem.io">
                        {tt('sidebarnewusers_jsx.the_blockchain')}
                    </a>
                </li>
                <li className="c-sidebar__list-item">
                    <a className="c-sidebar__link" href="/faq.html">
                        {tt('sidebarnewusers_jsx.faqs')}
                    </a>
                </li>
                <li className="c-sidebar__list-item">
                    <a className="c-sidebar__link" href={SIGNUP_URL}>
                        {tt('g.sign_up')}
                    </a>
                </li>
            </ul>
        </div>
    </div>
);

export default SidebarNewUsers;
