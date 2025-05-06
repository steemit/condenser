import React from 'react';
import tt from 'counterpart';
import { Link } from 'react-router';

const SidebarLinks = ({ username, topics }) => (
    <div className="c-sidebar__module">
        {/*
        <div className="c-sidebar__header">
            <h3 className="c-sidebar__h3">{tt('g.links')}</h3>
        </div>
        */}
        <div className="c-sidebar__content">
            <ul className="c-sidebar__list">
                {/*
                <li className="c-sidebar__list-item">
                    <a className="c-sidebar__link" href={'/@' + username}>
                        {tt('g.my_blog')}
                    </a>
                </li>
                */}
                {/*
                <li className="c-sidebar__list-item">
                    <a
                        className="c-sidebar__link"
                        href={'/@' + username + '/transfers'}
                    >
                        {tt('g.my_wallet')}
                    </a>
                </li>
                */}
                {topics && (
                    <li className="c-sidebar__list-item">
                        <div style={{ color: '#aaa', paddingTop: '0em' }}>
                            {tt('g.trending_communities')}
                        </div>
                    </li>
                )}
                {topics &&
                    topics.toJS().map(item => (
                        <li key={item[0]} className="c-sidebar__list-item">
                            <Link
                                className="c-sidebar__link"
                                to={`/trending/${item[0]}`}
                            >
                                {item[1]}
                            </Link>
                        </li>
                    ))}
            </ul>
        </div>
    </div>
);

export default SidebarLinks;
