import React from 'react';

const SidebarNewUsers = () => (
    <div className="c-sidebar__module">
        <div className="c-sidebar__header">
            <h3 className="c-sidebar__h3">New to Steemit?</h3>
        </div>
        <div className="c-sidebar__content">
            <ul className="c-sidebar__list">
                <li className="c-sidebar__list-item">
                    <a
                        className="c-sidebar__link"
                        href="/guide/@steemitblog/steemit-a-guide-for-newcomers"
                    >
                        Welcome Guide
                    </a>
                </li>
                {/*
                <li className="c-sidebar__list-item">
                    <a className="c-sidebar__link" href="/faq.html">
                        FAQs
                    </a>
                </li>
                <li className="c-sidebar__list-item">
                    <a className="c-sidebar__link" href="/@steemitblog">
                        {tt('g.read_offical_blog')}
                    </a>
                </li>
                
                <li className="c-sidebar__list-item">
                    <a
                        className="c-sidebar__link"
                        href="https://steem.com/SteemWhitePaper.pdf"
                    >
                        Whitepaper
                    </a>
                </li>
                */}
            </ul>
        </div>
    </div>
);

export default SidebarNewUsers;
