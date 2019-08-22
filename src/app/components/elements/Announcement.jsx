import PropTypes from 'prop-types';
import React from 'react';

export const Announcement = ({ onClose }) => (
    <div className="annoucement-banner">
        <p className="announcement-banner__text">
            Important Upgrade to Steem Blockchain Coming August 27, click{' '}
            <a
                className="announcement-banner__link"
                href="https://steemit.com/hf21/@steemitblog/hardfork-21-survival-guide"
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
