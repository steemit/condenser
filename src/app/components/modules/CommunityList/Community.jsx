import React from 'react';
import PropTypes from 'prop-types';
import SubscribeButtonContainer from 'app/components/elements/SubscribeButtonContainer';

export default function Community(props) {
    const { name, title, description } = props;
    console.log('Community.jsx::constructor()', props);

    return (
        <div className="communities__row">
            <div className="communities__names">
                <a href={`/trending/${name}`}>
                    {determineNiceTitle(name, title)}
                </a>
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

/**
 * Figure out which value to use - this probably will do more soon.
 * @param {string} name - start date
 * @param {string} title - stop date
 * @returns {string} - return fancy string
 */
function determineNiceTitle(name, title) {
    if (!title) {
        return name;
    }
    return title;
}
