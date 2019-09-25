import React from 'react';
import PropTypes from 'prop-types';

export default function SubscribeButton(props) {
    const { label, loading, onClick } = props;

    if (loading) {
        return (
            <button
                disabled
                className="button slim hollow secondary"
                type="button"
            >
                Loading...
            </button>
        );
    }

    return (
        <button
            onClick={onClick}
            className="button slim hollow secondary"
            type="button"
        >
            {label}
        </button>
    );
}

SubscribeButton.propTypes = {
    label: PropTypes.string.isRequired,
    loading: PropTypes.bool.isRequired,
    onClick: PropTypes.func.isRequired,
};
