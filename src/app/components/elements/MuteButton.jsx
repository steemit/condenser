import React from 'react';
import PropTypes from 'prop-types';

import Reveal from 'app/components/elements/Reveal';
import CloseButton from 'app/components/elements/CloseButton';
import MutePost from 'app/components/modules/MutePost';

export default function MuteButton(props) {
    const {
        label,
        loading,
        isMuted,
        onToggleMute,
        onToggleDialog,
        showDialog,
    } = props;

    if (loading) {
        return <span>Loading...</span>;
    }

    return (
        <span>
            <a onClick={() => onToggleDialog()}> {label} </a>
            {showDialog && (
                <Reveal onHide={() => null} show>
                    <CloseButton onClick={() => onToggleDialog()} />
                    <MutePost
                        isMuted={isMuted}
                        onSubmit={notes => {
                            onToggleDialog();
                            onToggleMute(isMuted, notes);
                        }}
                    />
                </Reveal>
            )}
        </span>
    );
}

MuteButton.propTypes = {
    label: PropTypes.string.isRequired,
    loading: PropTypes.bool.isRequired,
    isMuted: PropTypes.bool.isRequired,
    showDialog: PropTypes.bool.isRequired,
    onToggleMute: PropTypes.func.isRequired,
    onToggleDialog: PropTypes.func.isRequired,
};
