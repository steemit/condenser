import React from 'react';

export default class RocketChat extends React.Component {
    state = {toggled: false, open: false};

    toggle() {
        if (!this.state.toggled) {
            setTimeout(() => {
                this.setState({toggled: true})
            }, 550)
        }
        this.setState({
            open: !this.state.open
        });
    }

    link() {
        return this.state.toggled
            ? "https://chat.golos.io"
            : ""
    }

    iconUrl() {
        return "/images/RocketChat.png"
    }

    chatikClass() {
        return 'RocketChat sidepanel '
    }

    stateClass() {
        return this.state.open
            ? "open"
            : ""
    }

    render() {
        return <div className={this.chatikClass() + this.stateClass()}>
            <a className={this.stateClass()} href="https://chat.golos.io/" target="_blank"><img src={this.iconUrl()} alt="Наш чат в RocketChat" /></a>
            <div className="sidebar"></div>
        </div>;
    }
}
