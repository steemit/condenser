import React from 'react';
import QRCode from 'react-qr'
require('./QrKeyView.scss');
import { translate } from 'app/Translator';

export default ({type, text, isPrivate, onClose}) => {
    return (
        <div className="text-center Dialog__qr_viewer">
            <h3>{isPrivate ? translate('private_something_key', {key: type}) : translate('public_something_key', {key: type})}:</h3>
            <br />
            <QRCode text={text} />

            <div>
                <br />
                <button type="button" className="button hollow" onClick={onClose}>
                    {translate('close')}
                </button>
            </div>
        </div>
    );
}
