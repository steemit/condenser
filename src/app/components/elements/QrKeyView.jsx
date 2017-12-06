import React from 'react';
import QRCode from 'react-qr';
import tt from 'counterpart';

export default ({ type, text, isPrivate, onClose }) => {
    return (
        <div className="text-center Dialog__qr_viewer">
            <h3>
                {isPrivate
                    ? tt('userkeys_jsx.private_something_key', { key: type })
                    : tt('userkeys_jsx.public_something_key', { key: type })}:
            </h3>
            <br />
            <QRCode text={text} />

            <div>
                <br />
                <button
                    type="button"
                    className="button hollow"
                    onClick={onClose}
                >
                    {tt('g.close')}
                </button>
            </div>
        </div>
    );
};
