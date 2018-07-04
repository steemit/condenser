import React from 'react';
import settings from './settings';

export default function MobileAppButton() {
    if (process.env.BROWSER && navigator.userAgent.match(/Android/i)) {
        return (
            <div
                className="btn visit-app-btn"
                role="button"
                onClick={() => {
                    window.location.assign(settings.android.market_source);
                }}
            >
                Открыть в приложении
            </div>
        );
    }

    return null;
}
