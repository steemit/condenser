import React from 'react';
import PropTypes from 'prop-types';
import SubscribeButtonContainer from 'app/components/elements/SubscribeButtonContainer';
import { Link } from 'react-router';

export default function Community(props) {
    const { name, title, description } = props;

    return (
        <div className="communities__row">
            <div className="communities__names">
                <Link to={`/trending/${name}`}>{title}</Link>
            </div>
            <div className="communities__description">{description}</div>
            <div className="communities__subscription">
                <SubscribeButtonContainer community={name} />
            </div>
        </div>
    );
}

//TODO: Move Community type to a proptypes file and use where we need it.
Community.propTypes = {
    name: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
};
