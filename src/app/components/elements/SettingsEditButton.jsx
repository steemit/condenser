import React from 'react';
import PropTypes from 'prop-types';

import Reveal from 'app/components/elements/Reveal';
import CloseButton from 'app/components/elements/CloseButton';
import CommunitySettings from 'app/components/modules/CommunitySettings';

export default function SettingsButton(props) {
    const {
        label,
        loading,
        onSave,
        onToggleDialog,
        showDialog,
        settings,
    } = props;

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
        <span>
            <button
                onClick={onToggleDialog}
                className="button slim hollow secondary"
                type="button"
            >
                {label}
            </button>
            {showDialog && (
                <Reveal onHide={() => null} show>
                    <CloseButton onClick={() => onToggleDialog()} />
                    <CommunitySettings
                        {...settings}
                        onSubmit={newSettings => {
                            onToggleDialog();
                            onSave(newSettings);
                        }}
                    />
                </Reveal>
            )}
        </span>
    );
}

SettingsButton.propTypes = {
    label: PropTypes.string.isRequired,
    loading: PropTypes.bool.isRequired,
    showDialog: PropTypes.bool.isRequired,
    onSave: PropTypes.func.isRequired,
    onToggleDialog: PropTypes.func.isRequired,
    settings: PropTypes.object.isRequired, //TODO: Define this shape
};
