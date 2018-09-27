import PropTypes from 'prop-types';
import React from 'react';

export const Announcement = ({ onClose }) => (
    <div className="annoucement-banner">
        <p className="announcement-banner__text">
            The Steem blockchain was upgraded on September 25th. You may
            experience trouble posting and transacting while the new bandwidth
            system stabilizes.{' '}
            <a
                className="announcement-banner__link"
                href="https://steemit.com/@steemitblog/update-on-unexpected-voting-power-behavior"
            >
                Learn more.
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
