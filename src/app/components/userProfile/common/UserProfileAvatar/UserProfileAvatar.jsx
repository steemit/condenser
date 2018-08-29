import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import proxifyImageUrl from 'app/utils/ProxifyUrl';

import Icon from 'golos-ui/Icon';

const Wrapper = styled.div`
    display: flex;
    position: relative;
    align-items: center;
    justify-content: center;
    overflow: hidden;

    height: 125px;
    width: 125px;
    box-shadow: 0 6px 14px 0 rgba(0, 0, 0, 0.18);

    background-size: cover;
    background-repeat: no-repeat;
    background-position: 50% 50%;
    border-radius: 50%;
    background-color: #fff;
    background-image: ${({ backgroundUrl }) => `url(${backgroundUrl})`};
`;

export default class UserProfileAvatar extends PureComponent {
    static propTypes = {
        avatarUrl: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    };

    render() {
        const { children, avatarUrl } = this.props;
        const backgroundUrl = avatarUrl
            ? proxifyImageUrl(avatarUrl, '125x125')
            : null;

        return (
            <Wrapper backgroundUrl={backgroundUrl}>
                {!backgroundUrl && (
                    <Icon name="user" width="65" height="70" />
                )}
                {children}
            </Wrapper>
        );
    }
}
