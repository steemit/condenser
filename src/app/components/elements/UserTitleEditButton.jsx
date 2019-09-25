import React from 'react';
import PropTypes from 'prop-types';
import Icon from 'app/components/elements/Icon';
import Reveal from 'app/components/elements/Reveal';
import CloseButton from 'app/components/elements/CloseButton';
import UserTitle from 'app/components/modules/UserTitle';

export default function UserTitleEditButton(props) {
    const {
        loading,
        onSave,
        onToggleDialog,
        showDialog,
        title,
        username,
        community,
    } = props;

    if (loading) {
        return null;
    }

    return (
        <span>
            <a onClick={onToggleDialog}>
                <Icon name="pencil2" />
            </a>
            {showDialog && (
                <Reveal onHide={() => null} show>
                    <CloseButton onClick={() => onToggleDialog()} />
                    <UserTitle
                        title={title}
                        username={username}
                        community={community}
                        onSubmit={newTitle => {
                            onToggleDialog();
                            onSave(newTitle);
                        }}
                    />
                </Reveal>
            )}
        </span>
    );
}

UserTitleEditButton.propTypes = {
    loading: PropTypes.bool.isRequired,
    showDialog: PropTypes.bool.isRequired,
    onSave: PropTypes.func.isRequired,
    onToggleDialog: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
    community: PropTypes.string.isRequired,
};
