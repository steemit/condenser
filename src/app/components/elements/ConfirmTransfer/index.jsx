import React from 'react';
import PropTypes from 'prop-types';

const ConfirmTransfer = ({ operation }) => {
    const info = Object.keys(operation).map((k, i) => {
        return (
            <div key={`transaction-group-${i}`} className="input-group">
                <span
                    key={`transaction-label-${i}`}
                    className="input-group-label"
                >
                    {k}
                </span>
                <input
                    className="input-group-field"
                    type="text"
                    required
                    value={operation[k]}
                    disabled={true}
                    key={`transaction-input-${i}`}
                />
            </div>
        );
    });
    return <div className="info">{info}</div>;
};

ConfirmTransfer.propTypes = {
    operation: PropTypes.shape({
        from: PropTypes.string,
        to: PropTypes.string,
        amount: PropTypes.string,
    }).isRequired,
};

export default ConfirmTransfer;
