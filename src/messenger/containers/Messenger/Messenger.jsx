import React, { Component } from 'react';
import { Messenger, ChatListPanel }  from '../../components/Messenger';
import Chat  from '../Chat';
import ChatListContainer from '../ChatList';

import { dialogs, chatData } from '../../utils/_data';

export default class MessengerApp extends Component {

    render() {
        return (
            <Messenger>
                <ChatListPanel>
                    {/* search input */}
                    <ChatListContainer 
                        dialogs={dialogs}
                    />
                </ChatListPanel>
                <Chat data={chatData}/>
            </Messenger>
        );
    }
}