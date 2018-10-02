import PropTypes from 'prop-types';
import React from 'react';

export const Announcement = ({ onClose }) => (
    <div className="annoucement-banner">
        <p className="announcement-banner__text">
            HF20 Update: Operations Stable, click{' '}
            <a
                className="announcement-banner__link"
                href="https://steemit.com/steem/@steemitblog/hf20-update-operations-stable"
            >
                here.
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
