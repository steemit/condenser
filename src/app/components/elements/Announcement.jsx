import PropTypes from 'prop-types';
import React from 'react';

export const Announcement = ({ onClose }) => (
    <div className="annoucement-banner">
        <p className="announcement-banner__text">
            The Steem Blockchain is currently experiencing issues. Funds are
            safe. Updates{' '}
            <a
                className="announcement-banner__link"
                href="https://twitter.com/SteemNetwork/status/1166384414781313024"
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
