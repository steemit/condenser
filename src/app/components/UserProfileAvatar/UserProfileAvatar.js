import React, { Component } from 'react';
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

    > div {
        display: flex;
        align-items: center;
        justify-content: center;
        border: none !important;

        width: 100%;
        height: 100%;

        cursor: pointer;

        ${Icon} {
            display: none;
            z-index: 1;
            margin-left: 5px;
            margin-top: 5px;
        }

        &:hover {
            :after {
                content: '';
                position: absolute;
                left: 0;
                right: 0;
                top: 0;
                bottom: 0;
                background-color: rgba(248, 248, 248, 0.8);
            }

            ${Icon} {
                display: block;
            }
        }
    }
`;

export default class UserProfileAvatar extends Component {
    static propTypes = {
        avatarUrl: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    };

    render() {
        const { children, avatarUrl } = this.props;
        const backgroundUrl = avatarUrl
            ? proxifyImageUrl(avatarUrl, '120x120')
            : null;

        return (
            <Wrapper backgroundUrl={backgroundUrl}>
                {!backgroundUrl &&
                    <Icon name="user" width="65px" height="70px" />
                }
                {children &&
                    React.cloneElement(children, {
                        children: <Icon name="picture" size="20px" />,
                    })}
            </Wrapper>
        );
    }
}
