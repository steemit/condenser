import React from 'react';
import PropTypes from 'prop-types';
import Userpic from 'app/components/elements/Userpic';

export default function PostCategoryBanner(props) {
    const { label, labelSmall, loading, isCommunity } = props;

    if (loading) {
        return <span>Loading...</span>;
    }

    return (
        <div className="PostCategoryBanner column small-12 ">
            <div className="postTo">
                <small>
                    Posting to{' '}
                    <span className="smallLabel">
                        {isCommunity ? label : labelSmall}
                    </span>
                </small>
            </div>
            <div className="categoryName">
                <Userpic account={props.author} />
                <h3>{label}</h3>
            </div>
        </div>
    );
}

PostCategoryBanner.defaultProps = {
    labelSmall: '',
};

PostCategoryBanner.propTypes = {
    label: PropTypes.string.isRequired,
    labelSmall: PropTypes.string,
    loading: PropTypes.bool.isRequired,
    author: PropTypes.string.isRequired,
};
