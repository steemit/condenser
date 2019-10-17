import React from 'react';
import PropTypes from 'prop-types';
import SubscribeButton from 'app/components/elements/SubscribeButton';
import { Link } from 'react-router';

export default function Community(props) {
    const { name, title, about } = props;

    return (
        <div className="communities__row">
            <div className="communities__names">
                <Link to={`/trending/${name}`}>{title}</Link>
            </div>
            <div className="communities__description">{about}</div>
            <div className="communities__subscription">
                <SubscribeButton community={name} />
            </div>
        </div>
    );
}

//TODO: Move Community type to a proptypes file and use where we need it.
Community.propTypes = {
    name: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    about: PropTypes.string,
};
