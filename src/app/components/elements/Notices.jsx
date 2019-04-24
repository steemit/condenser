import React from 'react';
import tt from 'counterpart';
import { Link } from 'react-router';
import TimeAgoWrapper from 'app/components/elements/TimeAgoWrapper';

const Notice = ({ notice }) => {
    if (!notice || !notice.title) {
        return null;
    }

    const url = notice.permalink
        ? `/@${notice.author}/${notice.permlink}`
        : notice.url;
    const tag = notice.tag ? (
        <p className="Notices__featured">{notice.tag}</p>
    ) : null;
    const title = url ? (
        <Link className="Notices__title-link" to={url}>
            {notice.title}
        </Link>
    ) : (
        notice.title
    );
    const by = notice.author ? (
        <span className="Notices__by"> {tt('g.by')}&nbsp;</span>
    ) : null;
    const author = notice.author ? (
        <Link className="Notices__author-link" to={'/@' + notice.author}>
            {notice.author}
        </Link>
    ) : null;
    const date = notice.created ? (
        <span>
            {' . '}
            <TimeAgoWrapper date={notice.created} />
        </span>
    ) : null;

    return (
        <li className="Notices__notice">
            {tag}
            <p className="Notices__title">{title}</p>
            <p className="Notices__metadata">
                {by}
                {author}
                {date}
            </p>
        </li>
    );
};

const SteemitNotices = ({ notices }) => {
    if (!notices || notices.length === 0) {
        return null;
    }

    return (
        <div className="c-sidebar__module">
            <div className="c-sidebar__header">
                <h3 className="c-sidebar__h3">Updates Log</h3>
            </div>
            <div className="c-sidebar__content">
                <ul className="Notices">
                    {notices.map((notice, i) => (
                        <Notice key={i} notice={notice} />
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default SteemitNotices;
