import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled from 'styled-components';

import tt from 'counterpart';
import o2j from 'shared/clash/object2json';
import proxifyImageUrl from 'app/utils/ProxifyUrl';
import normalizeProfile from 'app/utils/NormalizeProfile';

import user from 'app/redux/User';
import transaction from 'app/redux/Transaction';

import Dropzone from 'react-dropzone';
import StyledButton from 'golos-ui/Button';
import Icon from 'golos-ui/Icon';
import Flex from './../Flex';
import StyledContainer from './../Container';
import UserProfileAvatar from './../UserProfileAvatar';
import Follow from './../Follow';

// Styled Components
const Wrapper = styled.div`
    display: flex;
    align-items: center;
    min-height: 207px;

    ${({ backgroundUrl }) => backgroundUrl ? 
        `
        background-size: cover;
        background-repeat: no-repeat;
        background-position: 50%;
        background-image: url(${backgroundUrl});
        ` 
        : 
        `
        background-size: 41px;
        background-repeat: repeat;
        background-position: 0 -26px;
        background-image: url('/images/profile/pattern.png');
        
        @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) { 
            background-image: url('/images/profile/pattern@2x.png');
        }
        `
    }
`;

const Container = StyledContainer.extend`
    position: relative;

    @media (max-width: 768px) {
        flex-direction: column;
    }

    @media (max-width: 1200px) {
        margin-top: 23px;
        margin-bottom: 23px;
    }
`;

const Details = styled.div`
    margin-left: 28px;

    @media (max-width: 768px) {
        margin-top: 12px;
        margin-left: 0;
        text-align: center;
    }
`;

const Name = styled.div`
    color: #393636;
    font-family: ${props => props.theme.fontFamilyBold};
    font-size: 30px;
    font-weight: bold;
    line-height: 1;
    text-shadow: 0 0 1px #fff;

    @media (max-width: 768px) {
        font-size: 18px;
    }
`;

const Login = styled.div`
    color: #757575;
    font-family: 'Helvetica Neue';
    font-size: 20px;
    line-height: 1;
    margin-top: 6px;
    text-shadow: 0px 0px 1px rgba(255,255,255,0.4);

    @media (max-width: 768px) {
        font-size: 14px;
    }
`;

const Buttons = Flex.extend`
    margin-top: 24px;
`;

const Button = StyledButton.extend`
    width: 167px;
`;

const IconCover = styled(Dropzone)`
    position: absolute !important;
    top: 9px;
    right: 34px;
    overflow: hidden;
    cursor: pointer;
`;

// Component
class UserHeader extends Component {
    static propTypes = {
        account: PropTypes.object,

        uploadImage: PropTypes.func,
        updateAccount: PropTypes.func,
        notify: PropTypes.func,
    };

    dropzoneAvatar = null;
    dropzoneCover = null;

    uploadDropped = (acceptedFiles, rejectedFiles, key) => {
        const {
            account,
            profile,
            uploadImage,
            updateAccount,
            notify,
        } = this.props;

        if (rejectedFiles.length) {
            notify(tt('reply_editor.please_insert_only_image_files'), 10000);
        }

        if (!acceptedFiles.length) return;

        const file = acceptedFiles[0];
        uploadImage(file, ({ error, url }) => {
            if (error) {
                // show error notification
                notify(error, 10000);
                return;
            }

            if (url) {
                profile[key] = url;

                updateAccount({
                    json_metadata: JSON.stringify({ profile }),
                    account: account.name,
                    memo_key: account.memo_key,
                    errorCallback: e => {
                        if (e !== 'Canceled') {
                            notify(tt('g.server_returned_error'), 10000);
                            console.log('updateAccount ERROR', e);
                        }
                    },
                    successCallback: () => {
                        notify(tt('g.saved') + '!', 10000);
                    },
                });
            }
        });
    };

    handleDropAvatar = (acceptedFiles, rejectedFiles) => {
        this.uploadDropped(acceptedFiles, rejectedFiles, 'profile_image');
    };

    handleDropCover = (acceptedFiles, rejectedFiles) => {
        this.uploadDropped(acceptedFiles, rejectedFiles, 'cover_image');
    };

    render() {
        const { account, userName, isOwner, follow } = this.props;
        const {
            name,
            // gender,
            // location,
            // about,
            // website,
            profile_image,
            cover_image,
        } = normalizeProfile(account);

        // const website_label = website
        //     ? website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')
        //     : null;

        const backgroundUrl = cover_image
            ? proxifyImageUrl(cover_image, '0x0')
            : false;

        return (
            <Wrapper backgroundUrl={backgroundUrl}>
                <Container align="center">
                    <UserProfileAvatar avatarUrl={profile_image}>
                        {isOwner ? (
                            <Dropzone
                                ref={r => (this.dropzoneAvatar = r)}
                                onDrop={this.handleDropAvatar}
                                multiple={false}
                                accept="image/*"
                            />
                        ) : null}
                    </UserProfileAvatar>
                    <Details>
                        {name ? <Name>{name}</Name> : null}
                        <Login>@{account.name}</Login>
                        {!isOwner && (
                            <Buttons>
                                {/* <Button light>
                                <Icon name="reply" height="17px" width="18px" />Написать
                            </Button> */}
                                <Follow
                                    follower={userName}
                                    following={account.name}
                                />
                            </Buttons>
                        )}
                    </Details>
                    <IconCover
                        ref={r => (this.dropzoneCover = r)}
                        onDrop={this.handleDropCover}
                        multiple={false}
                        accept="image/*"
                    >
                        <Icon name="picture" size="20px" />
                    </IconCover>
                </Container>
            </Wrapper>
        );
    }
}

export default connect(
    // mapStateToProps
    (state, { account }) => {
        const current_user = state.user.get('current');
        const userName = current_user ? current_user.get('username') : '';

        let metaData = account
            ? o2j.ifStringParseJSON(account.json_metadata)
            : {};
        const profile = metaData && metaData.profile ? metaData.profile : {};

        return {
            account,
            userName,
            metaData,
            isOwner: userName == account.name,
            profile,
            follow: state.global.get('follow'),
        };
    },
    // mapDispatchToProps
    dispatch => ({
        uploadImage: (file, progress) => {
            dispatch({
                type: 'user/UPLOAD_IMAGE',
                payload: { file, progress },
            });
        },
        updateAccount: ({ successCallback, errorCallback, ...operation }) => {
            dispatch(
                transaction.actions.broadcastOperation({
                    type: 'account_metadata',
                    operation,
                    successCallback() {
                        dispatch(user.actions.getAccount());
                        successCallback();
                    },
                    errorCallback,
                })
            );
        },
        notify: (message, dismiss = 3000) => {
            dispatch({
                type: 'ADD_NOTIFICATION',
                payload: {
                    key: 'settings_' + Date.now(),
                    message,
                    dismissAfter: dismiss,
                },
            });
        },
    })
)(UserHeader);
