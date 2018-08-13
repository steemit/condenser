import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Link } from 'react-router';

import tt from 'counterpart';

import Avatar from 'src/app/components/common/Avatar';

const Wrapper = styled.div`
    display: flex;
    align-items: center;
`;

const AvatarWrapper = styled.div`
    margin-right: 18px;
`;

const Message = styled.div`
    font-family: ${theme => theme.fontFamily};
    font-size: 14px;
`;

export default class NotificationContent extends PureComponent {
    render() {
        const { msg } = this.props;

        return (
            <Wrapper>
                <AvatarWrapper>
                    <Avatar
                        avatarUrl={
                            'https://imgp.golos.io/120x120/https://pp.userapi.com/c636629/v636629970/549de/xhum7CvvMHY.jpg'
                        }
                        size={40}
                    />
                </AvatarWrapper>
                <Message dangerouslySetInnerHTML={{ __html: msg }} />
            </Wrapper>
        );
    }
}
