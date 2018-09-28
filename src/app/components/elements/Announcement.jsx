import PropTypes from 'prop-types';
import React from 'react';

export const Announcement = ({ onClose }) => (
    <div className="annoucement-banner">
        <p className="announcement-banner__text">
            Update: HF20 restoring continuity. Read our{' '}
            <a
                className="announcement-banner__link"
                href="https://steemit.com/steem/@steemitblog/hf20-update-restoring-continuity"
            >
                latest post.
            </a>
        </p>
        <button className="close-button" type="button" onClick={onClose}>
            &times;
        </button>
    </div>
);

Announcement.propTypes = {
    onClose: PropTypes.func.isRequired,
};

export default Announcement;
