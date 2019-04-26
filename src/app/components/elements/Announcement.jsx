import PropTypes from 'prop-types';
import React from 'react';

export const Announcement = ({ onClose }) => (
    <div className="annoucement-banner">
        <p className="announcement-banner__text">
            Important Changes to Steemit.com and Wallet, click{' '}
            <a
                className="announcement-banner__link"
                href="https://steemit.com/steem/@steemitblog/social-condenser-is-live"
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
