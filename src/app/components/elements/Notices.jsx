import React from 'react';
import tt from 'counterpart';
import { Link } from 'react-router';

const SteemitNotices = ({ title, author, date }) => (
    <div className="c-sidebar__module">
        <div className="c-sidebar__header">
            <h3 className="c-sidebar__h3">Notices</h3>
        </div>
        <div className="c-sidebar__content">
            <ul className="Notices">
                <li className="Notices__notice">
                    <p className="Notices__title">{title}</p>
                    <p className="Notices__metadata">
                        <span className="Notices__by"> {tt('g.by')}&nbsp;</span>
                        <Link className="Notices__author-link" to={'@' + title}>
                            {author}
                        </Link>
                        {' • '}
                        {date}
                    </p>
                </li>
                <li className="Notices__notice">
                    <p className="Notices__featured">Featured</p>
                    <p className="Notices__title">
                        <Link className="Notices__title-link" to={'@' + title}>
                            {title}
                        </Link>
                    </p>
                    <p className="Notices__metadata">
                        <span className="Notices__by"> {tt('g.by')}&nbsp;</span>
                        <Link className="Notices__author-link" to={'@' + title}>
                            {author}
                        </Link>
                        {' • '}
                        {date}
                    </p>
                </li>
            </ul>
        </div>
    </div>
);

export default SteemitNotices;
