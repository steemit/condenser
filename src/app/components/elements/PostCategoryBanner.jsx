import React from 'react';
import PropTypes from 'prop-types';

export default function PostCategoryBanner(props) {
    const { label, labelSmall, image, loading } = props;

    if (loading) {
        return <span>Loading...</span>;
    }

    return (
        <div className="PostCategoryBanner column small-12 ">
            <div className="postTo">
                <small>
                    Post To: <span className="smallLabel">{labelSmall}</span>
                </small>
            </div>
            <div className="categoryName">
                <img
                    className="Userpic"
                    src={image}
                    alt={`${label} ${labelSmall}`}
                />
                <h3>{label}</h3>
            </div>
        </div>
    );
}

PostCategoryBanner.defaultProps = {
    labelSmall: '',
    image:
        'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y', //TOOD: Upload a default image
};

PostCategoryBanner.propTypes = {
    label: PropTypes.string.isRequired,
    labelSmall: PropTypes.string,
    image: PropTypes.string,
    loading: PropTypes.bool.isRequired,
};
