import React, { Component } from 'react';

import Chat from '../../components/Chat';

export default class ChatContainer extends Component {
    render() {
        const { data } = this.props;
        return (
            <Chat {...data} />
        );
    }
}
