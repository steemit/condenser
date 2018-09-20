import React, { Component } from 'react';
import styled from 'styled-components';

import Avatar from 'src/app/components/common/Avatar';

const MessageBubbleWrapper = styled.div`
    display: flex;
    flex-direction: ${({sender}) => sender === 'self' ? 'row' : 'row-reverse'};
    max-width: 320px;
`;

const Body = styled.div`
    display: flex;
    flex-direction: column;
    flex: 1;
`;

const Text = styled.div`
    flex: 1;
    overflow: hidden;
    
    margin-${({sender}) => sender === 'self' ? 'right' : 'left'}: 10px;
    padding: 7px 13px;
    
    font-size: 14px;
    color: ${({sender}) => sender === 'self' ? '#fff' : '#333'};
    border-radius: 8px;
    background-color: ${({sender}) => sender === 'self' ? '#2879FF' : '#f8f8f8'};
    
`;

const Time = styled.div`
    margin-${({sender}) => sender === 'self' ? 'right' : 'left'}: 22px;
    font-size: 10px;
    color: #959595;
    text-align: ${({sender}) => sender === 'self' ? 'right' : 'left'};
`;

export default class MessageBubble extends Component {
    render() {
        const {
            text,
            time,
            sender,
            profileAvatar
        } = this.props;
        return (
            <MessageBubbleWrapper sender={sender}>
                <Body>
                    <Text sender={sender}>
                        {text}
                    </Text>
                    <Time sender={sender}>
                        {time} 
                    </Time>
                </Body>
                <Avatar
                    avatarUrl={profileAvatar}
                    size={35}
                />
            </MessageBubbleWrapper>
        );
    }
}
