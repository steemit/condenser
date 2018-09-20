import React, { Component } from 'react';

import ChatList from '../../components/ChatList'
import ChatListItem from '../../components/ChatList/ChatListItem';

export default class ChatListContainer extends Component {
    render() {
        const { dialogs } = this.props;

        return (
            <ChatList>
                {dialogs.map(item => {
                    return (
                        <ChatListItem
                            key={item.userName}
                            userName = {item.userName}
                            profileImage = {item.profileImage}
                            profileName = {item.profileName}
                            time = {item.time}
                            lastMessage = {item.lastMessage}
                            unread = {item.unread}
                        />
                    );
                    })
                }
            </ChatList>
        );
    }
}
