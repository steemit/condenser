import React from 'react';
import PropTypes from 'prop-types';

export default function PostCategoryBanner(props) {
    const { label, image, loading } = props;

    if (loading) {
        return <span>Loading...</span>;
    }

    return (
        <div className="PostCategoryBanner">
            <small>Post To:</small>
            <img src={image} alt={label} />
            <h1>{label}</h1>
        </div>
    );
}

PostCategoryBanner.defaultProps = {
    image:
        'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y', //TOOD: Upload a default image
};

PostCategoryBanner.propTypes = {
    label: PropTypes.string.isRequired,
    image: PropTypes.string,
    loading: PropTypes.bool.isRequired,
};
