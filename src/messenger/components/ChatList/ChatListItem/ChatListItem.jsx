import React, { Component } from 'react';
import styled from 'styled-components';

import Avatar from 'src/app/components/common/Avatar';

const ChatListItemWrapper = styled.div`
    display: flex;
    align-items: center;
    flex: 1;
    
    padding: 18px;

    background-color: ${({unread}) => unread ? '#F8F8F8' : '#fff'};
    border-bottom: 1px solid #fff;
    cursor: pointer;
    user-select: none;
`;

const Name = styled.div`
    font-size: 14px;
    font-weight: bold;
    color: #393636;
`;

const MessagePreview = styled.div`
    font-size: 16px;
    color: #757575;
`;

const Time = styled.div`
    font-size: 12px;
    color: #959595;
`;

const Body = styled.div`
    flex: 1;
    flex-direction: column;

    margin-left: 10px;
`;

const Sender = styled.div`
    display: flex;
    justify-content: space-between;
`;

export default class ChatListItem extends Component {
    render() {
        const {
            profileImage,
            selected,
            unread,
            profileName,
            time,
            lastMessage
        } = this.props;

        return (
            <ChatListItemWrapper 
                unread={unread}
                selected={selected}
            >
                <Avatar
                    avatarUrl={profileImage}
                    size={40}
                />
                <Body>
                    <Sender>
                        <Name>{profileName}</Name>
                        <Time>{time}</Time>
                    </Sender>
                    <MessagePreview>
                        {lastMessage}
                    </MessagePreview>
                </Body>
            </ChatListItemWrapper>
        );
    }
}
